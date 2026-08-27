-- ============================================================================
-- FASOR, zona interna (/enlace)
-- Blindaje del rango propio y del último comandante.
--
-- Dónde se ejecuta: Supabase Dashboard, SQL Editor del proyecto.
-- Se ejecuta DESPUÉS de 01_gestion_miembros.sql. Es idempotente: reemplaza la
-- función de protecciones y vuelve a crear los dos triggers.
--
-- ----------------------------------------------------------------------------
-- QUÉ FALLABA
-- ----------------------------------------------------------------------------
-- La versión anterior metía toda la protección dentro de:
--
--     if new.id = auth.uid() then ...
--
-- Si `auth.uid()` es null, `new.id = null` no vale falso, vale NULL, y un IF
-- con condición NULL no entra. La rama entera se saltaba en silencio y el
-- UPDATE pasaba. Es decir, la protección desaparecía justo cuando no se sabe
-- quién actúa, que es exactamente al revés de como debe comportarse.
--
-- Esta versión arregla eso y añade lo que no existía, que es impedir que la
-- entidad se quede sin ningún comandante activo.
--
-- ----------------------------------------------------------------------------
-- REGLAS QUE APLICA
-- ----------------------------------------------------------------------------
-- 1. Nadie cambia su PROPIO rango, ni hacia arriba ni hacia abajo, sea cual
--    sea su cargo. Tampoco su propio `activo`. Y un capitán tampoco su propia
--    unidad, porque cambiarla lo dejaría sin alcance sobre la suya.
-- 2. Ninguna operación puede dejar cero comandantes activos. Esta regla es
--    incondicional: no mira quién llama, así que también frena a la clave de
--    servicio y al propio SQL Editor.
-- 3. El identificador de un perfil no se cambia nunca.
--
-- Sobre la regla 1 y el actor desconocido: sigue dependiendo de `auth.uid()`,
-- porque para saber si alguien se está tocando a sí mismo hay que saber quién
-- es. Lo que cambia es que ahora está escrito de forma explícita y que la
-- regla 2, que es la que evita el bloqueo de la entidad, NO depende de eso.
-- Se deja a propósito esa puerta para el SQL Editor: es la vía de rescate si
-- algún día hay que arreglar a mano un perfil, y la regla 2 la sigue cubriendo.
--
-- ----------------------------------------------------------------------------
-- OJO SI VUELVES A EJECUTAR ESTE ARCHIVO
-- ----------------------------------------------------------------------------
-- `05_cargos_junta.sql` REEMPLAZA `perfiles_protecciones()` con una versión que
-- conserva estas tres reglas y añade una cuarta: quien no se gestiona a sí mismo
-- por jerarquía, de su propia ficha solo puede cambiar el nombre. Esa cuarta
-- regla es la que cierra lo que el 05 abre en la política de edición, así que si
-- ejecutas este archivo, ejecuta el 05 a continuación. Si no, la política queda
-- abierta y el trigger sin el cerrojo, y por ejemplo un teniente podría
-- cambiarse su propia unidad.
-- ============================================================================

create or replace function public.perfiles_protecciones()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  -- Quién está actuando. null si no hay sesión de usuario (clave de servicio,
  -- SQL Editor). Se guarda en una variable para que se lea una sola vez.
  actor uuid := auth.uid();
  -- Si esta operación le quita el mando a un comandante activo
  pierde_el_mando boolean;
  comandantes_restantes integer;
begin
  if tg_op = 'DELETE' then
    -- No hay política de DELETE, así que por aquí solo puede entrar la clave
    -- de servicio. Aun así se comprueba: borrar al último comandante deja a la
    -- entidad igual de bloqueada que degradarlo.
    pierde_el_mando := old.rango = 'comandante' and old.activo is true;

  else
    if new.id is distinct from old.id then
      raise exception 'El identificador de un perfil no se puede cambiar';
    end if;

    -- ---- Regla 1, sobre uno mismo ----------------------------------------
    -- `actor is not null` va delante a propósito, para que la condición sea
    -- siempre verdadera o falsa y nunca NULL, que es lo que hacía que la
    -- comprobación se evaporara.
    if actor is not null and new.id = actor then
      if new.rango is distinct from old.rango then
        raise exception 'No puedes cambiar tu propio rango, ni subirlo ni bajarlo. Pídeselo a otro mando.';
      end if;

      if new.activo is distinct from old.activo then
        raise exception 'No puedes cambiar tu propia alta.';
      end if;

      -- Un capitán manda sobre su unidad, así que cambiarse la unidad lo
      -- dejaría sin alcance. Al comandante no le afecta, manda sobre todas.
      if old.rango = 'capitan' and new.unidad is distinct from old.unidad then
        raise exception 'No puedes cambiar tu propia unidad, perderías el mando sobre la tuya.';
      end if;
    end if;

    -- `is true` / `is not true` en lugar de `activo` / `not activo`: si la
    -- columna llegara a null, `not null` valdría NULL y el IF de más abajo no
    -- entraría. Es el mismo fallo en abierto que se está corrigiendo aquí.
    pierde_el_mando := old.rango = 'comandante'
      and old.activo is true
      and (new.rango is distinct from 'comandante' or new.activo is not true);
  end if;

  -- ---- Regla 2, la entidad nunca se queda sin comandante activo -----------
  -- Incondicional. No mira `actor`, así que cubre cualquier vía de escritura.
  if pierde_el_mando then
    -- El bloqueo serializa esta comprobación. Sin él, dos degradaciones a la
    -- vez podrían ver cada una «queda otro» y dejar cero.
    perform pg_advisory_xact_lock(hashtext('perfiles_ultimo_comandante'));

    -- La función es `security definer`, así que este recuento ve la tabla
    -- entera y no solo lo que RLS dejaría ver a quien llama. Tiene que ser así:
    -- un capitán no ve a los comandantes, y el recuento debe ser real.
    select count(*)
      into comandantes_restantes
      from public.perfiles p
     where p.rango = 'comandante'
       and p.activo is true
       and p.id <> old.id;

    if comandantes_restantes = 0 then
      raise exception 'No puedes dejar a la entidad sin ningún comandante activo. Nombra antes a otro comandante.';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end
$$;

drop trigger if exists perfiles_protecciones on public.perfiles;
create trigger perfiles_protecciones
before update on public.perfiles
for each row
execute function public.perfiles_protecciones();

drop trigger if exists perfiles_protecciones_borrado on public.perfiles;
create trigger perfiles_protecciones_borrado
before delete on public.perfiles
for each row
execute function public.perfiles_protecciones();

-- ============================================================================
-- COMPROBACIONES
-- ============================================================================

-- ---------------------------------------------------------------------------
-- (a) ¿Están instalados los triggers?
-- ---------------------------------------------------------------------------
-- Esta es la consulta que faltaba para saber si el trigger anterior llegó a
-- crearse. Debe devolver DOS filas, una de UPDATE y otra de DELETE, y la
-- columna `habilitado` debe valer 'O' (origen, es decir, activo).
--
--     select t.tgname as trigger,
--            case t.tgtype::integer & 28
--              when 16 then 'UPDATE' when 8 then 'DELETE' else 'otro' end as evento,
--            t.tgenabled as habilitado
--       from pg_trigger t
--      where t.tgrelid = 'public.perfiles'::regclass
--        and not t.tgisinternal
--      order by t.tgname;

-- ---------------------------------------------------------------------------
-- (b) Probar la regla 1 DE VERDAD, con identidad simulada
-- ---------------------------------------------------------------------------
-- El SQL Editor corre sin sesión, así que `auth.uid()` es null y la regla 1 no
-- se puede probar tal cual. Se simula la identidad poniendo las mismas claims
-- que pondría PostgREST, y se adopta el rol `authenticated` para que además se
-- apliquen las políticas RLS igual que desde la web.
--
-- TODO EL BLOQUE ACABA EN ROLLBACK, así que no cambia nada.
-- Sustituye el UUID por el del comandante (lo saca la primera consulta).
--
--     begin;
--       select id from public.perfiles where rango = 'comandante' and activo;
--
--       set local role authenticated;
--       select set_config(
--         'request.jwt.claims',
--         json_build_object('sub', 'PON-AQUI-EL-UUID', 'role', 'authenticated')::text,
--         true
--       );
--
--       -- Debe FALLAR con «No puedes cambiar tu propio rango»
--       update public.perfiles set rango = 'cadete' where id = 'PON-AQUI-EL-UUID';
--     rollback;
--
-- Qué debes ver: el UPDATE aborta con
--     ERROR: No puedes cambiar tu propio rango, ni subirlo ni bajarlo. Pídeselo a otro mando.
-- Si en cambio dice «UPDATE 1», el trigger NO está haciendo su trabajo.
--
-- Repite el mismo bloque cambiando la última línea para las otras dos reglas:
--     update public.perfiles set activo = false where id = 'PON-AQUI-EL-UUID';
--       -> ERROR: No puedes cambiar tu propia alta.
--     update public.perfiles set nombre = 'Prueba' where id = 'PON-AQUI-EL-UUID';
--       -> UPDATE 1, esto SÍ se permite (el nombre propio se puede cambiar).

-- ---------------------------------------------------------------------------
-- (c) Probar la regla 2, el último comandante
-- ---------------------------------------------------------------------------
-- Esta no necesita identidad, porque es incondicional. Sin `set local role`,
-- el SQL Editor entra como dueño de la tabla y se salta RLS, que es justo el
-- caso que interesa comprobar: ni con esos permisos debe poder dejarse a cero.
--
--     begin;
--       update public.perfiles set rango = 'capitan'
--        where id = (select id from public.perfiles
--                     where rango = 'comandante' and activo limit 1);
--     rollback;
--
-- Qué debes ver, SI solo hay un comandante activo:
--     ERROR: No puedes dejar a la entidad sin ningún comandante activo. Nombra antes a otro comandante.
-- Si hubiera dos o más comandantes activos, este UPDATE sí pasa (y el rollback
-- lo deshace), porque queda mando de sobra. Para probar el caso límite con dos,
-- degrada a uno dentro de la misma transacción y luego intenta con el otro.
