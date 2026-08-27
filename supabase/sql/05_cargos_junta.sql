-- ============================================================================
-- FASOR, zona interna (/enlace)
-- Cargos de Junta Directiva: secretario y tesorero.
--
-- Dónde se ejecuta: Supabase Dashboard, SQL Editor del proyecto.
-- Se ejecuta DESPUÉS de 01, 02, 03 y 04. Es idempotente.
--
-- ****************************************************************************
-- ESTE ARCHIVO SE EJECUTA EN DOS VECES. NO LO LANCES ENTERO DE UNA SOLA VEZ.
-- El motivo está explicado en el banner de la PARTE A. Si lo lanzas entero,
-- aborta y no queda nada aplicado, así que no se rompe nada, pero tampoco se
-- instala nada.
-- ****************************************************************************
--
-- ----------------------------------------------------------------------------
-- QUÉ AÑADE
-- ----------------------------------------------------------------------------
-- La Junta Directiva es un órgano de gobierno estatutario y NO es el escalafón
-- operativo. Hasta ahora en la base de datos solo existía el escalafón, con sus
-- cinco rangos. Se añaden dos cargos más al enum `rango`, y se comportan así:
--
--   * NO tienen nivel en el escalafón. No son superiores ni inferiores de
--     nadie. `nivel_rango()` devuelve null para ellos, a propósito.
--   * NO generan ni reciben avisos de cadena de mando, en ningún caso, y
--     tampoco lo provoca quien les escribe.
--   * NO tienen unidad, y eso lo garantiza una restricción de la sección 6.
--   * Gestionan a cualquier miembro de cualquier unidad, con dos excepciones
--     absolutas que están en `puede_gestionar()`, sección 3.
--
-- ----------------------------------------------------------------------------
-- ADVERTENCIA IMPORTANTE SOBRE EL ARCHIVO 02
-- ----------------------------------------------------------------------------
-- Este archivo REEMPLAZA `perfiles_protecciones()`, que instaló el 02. Si algún
-- día se vuelve a ejecutar el 02, hay que ejecutar este a continuación: el 02
-- reinstalaría una versión que no conoce la regla del nombre propio y dejaría
-- abierto el hueco que abre la sección 4. Está avisado en los dos archivos.
-- ============================================================================


-- ############################################################################
-- ############################################################################
-- ##                                                                        ##
-- ##   PARTE A. EJECUTA SOLO ESTO, SELECCIONANDO ESTAS DOS LÍNEAS.          ##
-- ##                                                                        ##
-- ##   Por qué va aparte: `alter type ... add value` se puede lanzar dentro  ##
-- ##   de una transacción, pero el valor recién añadido NO se puede USAR     ##
-- ##   hasta que esa transacción termine. El SQL Editor manda todo el script ##
-- ##   como una sola transacción implícita, y la PARTE B usa los literales   ##
-- ##   'secretario' y 'tesorero' al crear funciones y políticas, que se      ##
-- ##   analizan en el momento de crearse. Lanzarlo todo junto da el error    ##
-- ##   55P04, «unsafe use of new value of enum type», y lo aborta todo.      ##
-- ##                                                                        ##
-- ##   Los dos valores se añaden AL FINAL del enum. Su posición no significa ##
-- ##   nada, porque estos cargos están fuera del escalafón; solo se nota en  ##
-- ##   la consulta de diagnóstico del 03 que ordena `order by rango`.        ##
-- ##                                                                        ##
-- ############################################################################
-- ############################################################################

alter type public.rango add value if not exists 'secretario';
alter type public.rango add value if not exists 'tesorero';

-- ############################################################################
-- ##   FIN DE LA PARTE A. Antes de seguir, comprueba que el enum ya lista    ##
-- ##   los siete valores:                                                    ##
-- ##                                                                        ##
-- ##     select enumlabel from pg_enum e join pg_type t on t.oid = e.enumtypid
-- ##      where t.typname = 'rango' order by e.enumsortorder;                ##
-- ##                                                                        ##
-- ##   Cuando lo veas, ejecuta la PARTE B (o el archivo entero, que a partir ##
-- ##   de aquí es equivalente: el `if not exists` convierte la PARTE A en    ##
-- ##   una no operación).                                                    ##
-- ############################################################################


-- ############################################################################
-- ##                          PARTE B                                       ##
-- ############################################################################


-- ============================================================================
-- 1. LA CADENA DE MANDO NO LOS INCLUYE
-- ============================================================================
-- `nivel_rango()` devuelve NULL para los dos cargos, y está escrito con un
-- `else null` explícito para que se lea como una decisión y no como un olvido.
-- Darles un número los haría comparables con el escalafón, que es exactamente
-- lo que no son: no mandan sobre nadie por cargo, ni nadie manda sobre ellos.
--
-- Ojo, esto obliga a revisar TODA comparación que use esta función, porque
-- comparar contra NULL no da falso, da NULL. Ver la sección 2.
create or replace function public.nivel_rango(p_rango public.rango)
returns integer
language sql
immutable
as $$
  select case p_rango
    when 'comandante' then 1
    when 'capitan' then 2
    when 'teniente' then 3
    when 'operador' then 4
    when 'cadete' then 5
    -- secretario y tesorero: sin nivel, a propósito.
    else null
  end
$$;

-- Superior inmediato. Los cargos de Junta no tienen (no hay nadie por encima de
-- ellos en el escalafón, porque no están en él), y tampoco son el superior
-- inmediato de nadie: este `case` no los devuelve nunca, así que un aviso no
-- puede ir dirigido a ellos.
create or replace function public.superior_inmediato(p_rango public.rango)
returns public.rango
language sql
immutable
as $$
  select case p_rango
    when 'cadete' then 'teniente'::public.rango
    when 'operador' then 'teniente'::public.rango
    when 'teniente' then 'capitan'::public.rango
    when 'capitan' then 'comandante'::public.rango
    -- comandante, secretario y tesorero: sin superior inmediato.
    else null
  end
$$;


-- ============================================================================
-- 2. EL AVISO DE CADENA, QUE FALLABA EN ABIERTO
-- ============================================================================
-- La versión del archivo 03 decidía si había salto con esta línea:
--
--     if public.nivel_rango(rango_destinatario) >= public.nivel_rango(rango_superior) then
--       return new;  -- no hay salto
--     end if;
--
-- Con un rango sin nivel, `nivel_rango()` devuelve NULL, la comparación vale
-- NULL, el IF no entra y la función SIGUE hasta el insert de avisos. Es decir,
-- escribir a un secretario habría generado avisos a los tenientes. Es el mismo
-- fallo en abierto del archivo 02, repetido: una condición que vale NULL no
-- vale falso, se salta la rama entera.
--
-- Se arregla por dos vías a la vez, a propósito:
--   (1) una guarda explícita al principio, que saca del aviso a cualquiera que
--       esté fuera del escalafón, sea remitente o destinatario;
--   (2) la comparación envuelta en `coalesce(..., true)`, de modo que si algún
--       día aparece otro rango sin nivel y alguien olvida la guarda (1), el
--       fallo sea CERRADO (no se avisa) en lugar de abierto.
--
-- Los tres casos que quedan cubiertos, y el tercero conviene decirlo en voz
-- alta porque no es evidente:
--   * un secretario escribe a quien sea      -> sin aviso (no tiene superior)
--   * nadie recibe avisos siendo secretario  -> nunca es `superior_inmediato`
--   * un cadete escribe a un secretario      -> SIN AVISO a su teniente,
--     porque escribir a quien no está en la cadena no es saltarse a nadie.
--
-- El resto de la función es idéntico al del archivo 03, incluido el bloque con
-- `exception` que garantiza que el envío no se bloquea nunca por esto.
create or replace function public.mensajes_aviso_cadena()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  rango_remitente public.rango;
  unidad_remitente public.unidad;
  rango_destinatario public.rango;
  rango_superior public.rango;
begin
  begin
    select p.rango, p.unidad into rango_remitente, unidad_remitente
      from public.perfiles p where p.id = new.remitente;

    select p.rango into rango_destinatario
      from public.perfiles p where p.id = new.destinatario;

    if rango_remitente is null or rango_destinatario is null then
      return new;
    end if;

    -- (1) Fuera del escalafón, fuera de la cadena. Ni por un lado ni por otro.
    if public.nivel_rango(rango_remitente) is null
       or public.nivel_rango(rango_destinatario) is null then
      return new;
    end if;

    rango_superior := public.superior_inmediato(rango_remitente);
    if rango_superior is null then
      return new;  -- el comandante no tiene superior al que saltarse
    end if;

    -- (2) Null safe: si la comparación no se puede hacer, no se avisa.
    if coalesce(
         public.nivel_rango(rango_destinatario) >= public.nivel_rango(rango_superior),
         true
       ) then
      return new;  -- no hay salto
    end if;

    if unidad_remitente is null then
      return new;  -- sin unidad no hay a quién avisar, y el mensaje se envía igual
    end if;

    insert into public.avisos_cadena (mando, remitente, destinatario)
    select p.id, new.remitente, new.destinatario
      from public.perfiles p
     where p.rango = rango_superior
       and p.unidad = unidad_remitente
       and p.activo is true
       and p.id is distinct from new.remitente;

  exception when others then
    raise warning 'FASOR: no se ha podido registrar el aviso de cadena de mando (%). El mensaje se ha enviado igual.',
      sqlerrm;
  end;

  return new;
end
$$;

drop trigger if exists mensajes_aviso_cadena on public.mensajes;
create trigger mensajes_aviso_cadena
after insert on public.mensajes
for each row
execute function public.mensajes_aviso_cadena();


-- ============================================================================
-- 3. LA JERARQUÍA DE GESTIÓN, CON LOS DOS CARGOS
-- ============================================================================
-- Sigue estando en un solo sitio. Lo que se añade:
--
--   secretario y tesorero  gestionan a cualquier miembro de cualquier unidad,
--                          CON DOS EXCEPCIONES ABSOLUTAS:
--                            a) no tocan a un comandante, de ninguna forma;
--                            b) no crean ni ascienden a nadie a comandante,
--                               secretario ni tesorero.
--
-- La (b) no es un adorno de la (a): sin ella tendrían una vía indirecta para
-- saltársela, ascendiendo a alguien a comandante o nombrando a un aliado.
-- Entre ellos tampoco se gestionan, ni a sí mismos, y por eso los tres cargos
-- van juntos en la misma lista prohibida. Cambiarse el propio nombre sí pueden,
-- pero eso no pasa por aquí, pasa por la sección 4.
--
-- Los cinco verbos de la gestión quedan cubiertos sin escribir nada más:
--   crear      -> política de alta, `with check`
--   editar     -> política de edición, `using` sobre la fila vieja
--   ascender   -> política de edición, `with check` sobre la fila nueva
--   baja       -> es un UPDATE, luego pasa por la política de edición
--   contraseña -> función Edge, que repite esta misma comprobación
--
-- `p_rango is not null and` va delante en las dos ramas nuevas para que la
-- condición sea siempre verdadera o falsa y nunca NULL. Misma lección del 02.
create or replace function public.puede_gestionar(
  p_rango public.rango,
  p_unidad public.unidad
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case public.mi_rango()
    when 'comandante' then true
    when 'capitan' then
      p_rango in ('teniente', 'operador', 'cadete')
      and p_unidad is not null
      and p_unidad = public.mi_unidad()
    when 'secretario' then
      p_rango is not null
      and p_rango not in ('comandante', 'secretario', 'tesorero')
    when 'tesorero' then
      p_rango is not null
      and p_rango not in ('comandante', 'secretario', 'tesorero')
    else false
  end
$$;

-- Lectura. Los cargos de Junta ven a toda la entidad, porque gestionan a toda
-- la entidad. Ven también al comandante, cuya ficha les aparece bloqueada: se
-- puede mirar y no se puede tocar, que son dos cosas distintas.
--
-- `mi_rango()` devuelve null si no hay sesión o si la cuenta está de baja, y
-- `null in (...)` vale NULL, que RLS trata como denegado. Falla en cerrado.
drop policy if exists "perfiles_lectura" on public.perfiles;
create policy "perfiles_lectura"
on public.perfiles
for select
to authenticated
using (
  id = auth.uid()
  or public.mi_rango() = 'comandante'
  or public.mi_rango() in ('secretario', 'tesorero')
  or (public.mi_rango() = 'capitan' and unidad is not null and unidad = public.mi_unidad())
);


-- ============================================================================
-- 4. EL NOMBRE PROPIO SE PUEDE CAMBIAR SIEMPRE
-- ============================================================================
-- Antes de esto, quien no era gestionable por sí mismo (capitán, teniente,
-- operador, cadete, y ahora secretario y tesorero) no podía cambiar ni su
-- propio nombre, porque la política de edición solo dejaba pasar lo que
-- `puede_gestionar()` autorizaba. Era un efecto colateral de la jerarquía, no
-- una decisión: cambiarse el nombre no da poder sobre nadie y no tiene por qué
-- depender de un mando.
--
-- Se abre en la política, y se cierra en el trigger. La política deja pasar el
-- UPDATE sobre la propia fila; el trigger de la sección 5 se encarga de que de
-- esa fila solo pueda cambiar el nombre. Abrir sin lo segundo sería un agujero:
-- un teniente podría cambiarse la unidad, que el 02 solo blinda para capitanes.
--
-- Se exige `mi_rango() is not null`, o sea cuenta activa: quien está de baja no
-- se renombra a sí mismo.
drop policy if exists "perfiles_edicion" on public.perfiles;
create policy "perfiles_edicion"
on public.perfiles
for update
to authenticated
using (
  public.puede_gestionar(rango, unidad)
  or (public.mi_rango() is not null and auth.uid() is not null and id = auth.uid())
)
with check (
  public.puede_gestionar(rango, unidad)
  or (public.mi_rango() is not null and auth.uid() is not null and id = auth.uid())
);


-- ============================================================================
-- 5. EL CERROJO DE LA FICHA PROPIA
-- ============================================================================
-- Reemplaza `perfiles_protecciones()` del archivo 02. Las tres reglas del 02 se
-- conservan VERBATIM, con sus mismos mensajes, y se añade una cuarta.
--
-- Regla 4 (nueva): quien NO podría gestionarse a sí mismo por jerarquía, de su
-- propia ficha solo puede cambiar el nombre. Cualquier otra columna que cambie
-- se rechaza.
--
-- Por qué está condicionada a `puede_gestionar()` y no se aplica a todo el
-- mundo: al comandante sí se le permite hoy cambiarse su propia unidad, y
-- quitárselo sería una restricción nueva que nadie ha pedido y que además no
-- tendría arreglo, porque nadie más puede editar a un comandante. Los rangos y
-- cargos que sí quedan bajo la regla 4 son exactamente los que se benefician de
-- la apertura de la sección 4, así que la apertura no les da nada más.
--
-- La comparación se hace sobre la fila entera convertida a jsonb, quitando la
-- clave `nombre`, en lugar de enumerar columnas. Así, si algún día se añade una
-- columna a `perfiles`, nace blindada sin que nadie tenga que acordarse.
--
-- Y como en el 02: toda condición es siempre verdadera o falsa, nunca NULL.
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

    -- ---- Reglas sobre uno mismo -------------------------------------------
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

      -- Regla 4. El cerrojo de la ficha propia, para quien no se gestiona a sí
      -- mismo. `coalesce` porque `puede_gestionar()` podría devolver NULL y una
      -- protección nunca puede depender de un NULL.
      if not coalesce(public.puede_gestionar(old.rango, old.unidad), false) then
        if to_jsonb(new) - 'nombre' is distinct from to_jsonb(old) - 'nombre' then
          raise exception 'De tu propia ficha solo puedes cambiar el nombre. Lo demás te lo tiene que cambiar un mando.';
        end if;
      end if;
    end if;

    -- `is true` / `is not true` en lugar de `activo` / `not activo`: si la
    -- columna llegara a null, `not null` valdría NULL y el IF de más abajo no
    -- entraría. Es el mismo fallo en abierto que se corrigió en el 02.
    pierde_el_mando := old.rango = 'comandante'
      and old.activo is true
      and (new.rango is distinct from 'comandante' or new.activo is not true);
  end if;

  -- ---- La entidad nunca se queda sin comandante activo --------------------
  -- Incondicional. No mira `actor`, así que cubre cualquier vía de escritura,
  -- incluidas la clave de servicio y el propio SQL Editor. Los cargos nuevos no
  -- la debilitan: no pueden degradar a un comandante (no lo gestionan) y aunque
  -- pudieran, esta comprobación no pregunta quién llama.
  if pierde_el_mando then
    -- El bloqueo serializa esta comprobación. Sin él, dos degradaciones a la
    -- vez podrían ver cada una «queda otro» y dejar cero.
    perform pg_advisory_xact_lock(hashtext('perfiles_ultimo_comandante'));

    -- La función es `security definer`, así que este recuento ve la tabla
    -- entera y no solo lo que RLS dejaría ver a quien llama.
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
-- 6. LOS CARGOS DE JUNTA NO TIENEN UNIDAD
-- ============================================================================
-- En la base de datos y no solo en la pantalla, porque lo que solo garantiza la
-- pantalla acaba saltándose. Se añade solo si aún no existe y solo si los datos
-- lo permiten, avisando en vez de romper, como hace el archivo 03.
--
-- `rango not in (...)` vale NULL si el rango fuera nulo, y una restricción NULL
-- se considera satisfecha. No es un hueco: `perfiles.rango` no es nulo, y si lo
-- fuera el problema sería otro y mayor.
do $$
begin
  if exists (
    select 1 from pg_constraint
     where conname = 'perfiles_cargo_junta_sin_unidad'
       and conrelid = 'public.perfiles'::regclass
  ) then
    raise notice 'FASOR: la restricción perfiles_cargo_junta_sin_unidad ya existía, no se toca.';

  elsif exists (
    select 1 from public.perfiles
     where rango in ('secretario', 'tesorero') and unidad is not null
  ) then
    raise warning 'FASOR: hay perfiles de secretario o tesorero CON unidad, así que no se ha podido crear la restricción. Pon esas unidades a null y vuelve a ejecutar esta sección.';

  else
    alter table public.perfiles
      add constraint perfiles_cargo_junta_sin_unidad
      check (rango not in ('secretario', 'tesorero') or unidad is null);
  end if;
end
$$;


-- ============================================================================
-- 7. COMPROBACIONES
-- ============================================================================
-- Ejecútalas después de la PARTE B y contrasta lo que ves.

-- ---------------------------------------------------------------------------
-- (a) El enum tiene los siete valores
-- ---------------------------------------------------------------------------
--     select enumlabel from pg_enum e join pg_type t on t.oid = e.enumtypid
--      where t.typname = 'rango' order by e.enumsortorder;
--
-- Debe listar comandante, capitan, teniente, operador, cadete, secretario y
-- tesorero, en ese orden.

-- ---------------------------------------------------------------------------
-- (b) Los cargos están fuera de la cadena de mando
-- ---------------------------------------------------------------------------
-- Las cuatro columnas deben valer true. No necesita identidad ni datos.
--
--     select public.nivel_rango('secretario') is null        as secretario_sin_nivel,
--            public.nivel_rango('tesorero') is null          as tesorero_sin_nivel,
--            public.superior_inmediato('secretario') is null as secretario_sin_superior,
--            public.superior_inmediato('tesorero') is null   as tesorero_sin_superior;

-- ---------------------------------------------------------------------------
-- (c) Nadie puede ser el superior inmediato de nadie siendo cargo de Junta
-- ---------------------------------------------------------------------------
-- Debe devolver CERO filas. Si devolviera alguna, un cargo de Junta estaría
-- recibiendo avisos de cadena de mando.
--
--     select r as rango, public.superior_inmediato(r) as superior
--       from unnest(enum_range(null::public.rango)) r
--      where public.superior_inmediato(r) in ('secretario', 'tesorero');

-- ---------------------------------------------------------------------------
-- (d) La jerarquía de gestión, vista con los ojos de un secretario
-- ---------------------------------------------------------------------------
-- Necesita un secretario ya dado de alta. Sustituye el UUID por el suyo. TODO
-- EL BLOQUE ACABA EN ROLLBACK, así que no cambia nada.
--
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DEL-SECRETARIO','role','authenticated')::text, true);
--
--       select public.puede_gestionar('teniente','forestal')   as debe_ser_true,
--              public.puede_gestionar('cadete', null)          as debe_ser_true_2,
--              public.puede_gestionar('comandante', null)      as debe_ser_false,
--              public.puede_gestionar('secretario', null)      as debe_ser_false_2,
--              public.puede_gestionar('tesorero', null)        as debe_ser_false_3;
--     rollback;

-- ---------------------------------------------------------------------------
-- (e) Un secretario no toca al comandante ni fabrica cargos
-- ---------------------------------------------------------------------------
-- Los tres UPDATE deben fallar. Los dos primeros por la política (verás
-- «new row violates row-level security policy» o cero filas afectadas, que en
-- un UPDATE bloqueado por el `using` es lo mismo) y el tercero igual.
--
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DEL-SECRETARIO','role','authenticated')::text, true);
--
--       -- 1. Editar al comandante. Debe afectar a CERO filas.
--       update public.perfiles set nombre = 'Intento'
--        where rango = 'comandante';
--
--       -- 2. Ascender a un teniente a comandante. Debe fallar o afectar a cero.
--       update public.perfiles set rango = 'comandante'
--        where rango = 'teniente';
--
--       -- 3. Nombrar a otro tesorero. Debe fallar o afectar a cero.
--       update public.perfiles set rango = 'tesorero'
--        where rango = 'operador';
--     rollback;

-- ---------------------------------------------------------------------------
-- (f) El nombre propio sí, lo demás no
-- ---------------------------------------------------------------------------
-- Con la identidad de un capitán, de un secretario o de cualquier rango que no
-- se gestione a sí mismo. Sustituye el UUID.
--
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','PON-AQUI-EL-UUID','role','authenticated')::text, true);
--
--       -- Debe pasar, UPDATE 1
--       update public.perfiles set nombre = 'Nombre Nuevo' where id = 'PON-AQUI-EL-UUID';
--
--       -- Debe FALLAR con «No puedes cambiar tu propio rango...»
--       update public.perfiles set rango = 'comandante' where id = 'PON-AQUI-EL-UUID';
--
--       -- Debe FALLAR con «No puedes cambiar tu propia alta.»
--       update public.perfiles set activo = false where id = 'PON-AQUI-EL-UUID';
--
--       -- Con un TENIENTE (no capitán), debe FALLAR con
--       -- «De tu propia ficha solo puedes cambiar el nombre...»
--       update public.perfiles set unidad = 'forestal' where id = 'PON-AQUI-EL-UUID';
--     rollback;

-- ---------------------------------------------------------------------------
-- (g) El último comandante sigue blindado
-- ---------------------------------------------------------------------------
-- Sin identidad, como en el 02: el SQL Editor entra como dueño de la tabla y se
-- salta RLS, que es justo el caso que interesa.
--
--     begin;
--       update public.perfiles set rango = 'secretario'
--        where id = (select id from public.perfiles
--                     where rango = 'comandante' and activo limit 1);
--     rollback;
--
-- Con un solo comandante activo debe verse:
--     ERROR: No puedes dejar a la entidad sin ningún comandante activo. Nombra antes a otro comandante.

-- ---------------------------------------------------------------------------
-- (h) La restricción de unidad está puesta
-- ---------------------------------------------------------------------------
--     select conname, pg_get_constraintdef(oid)
--       from pg_constraint
--      where conrelid = 'public.perfiles'::regclass
--        and conname = 'perfiles_cargo_junta_sin_unidad';


-- ============================================================================
-- 8. ADVERTENCIAS
-- ============================================================================
-- 1. UN VALOR DE ENUM NO SE PUEDE QUITAR. PostgreSQL no tiene
--    `alter type ... drop value`. Si algún día sobran estos cargos, lo que se
--    hace es dejar de usarlos, no borrarlos. Tenlo en cuenta antes de añadir
--    más valores «por si acaso».
--
-- 2. ESTE ARCHIVO MANDA SOBRE EL 02. Reemplaza `perfiles_protecciones()`. Si
--    vuelves a ejecutar el 02, ejecuta este después, o la ficha propia se queda
--    sin el cerrojo de la regla 4 mientras la política de edición sigue abierta.
--
-- 3. LAS FUNCIONES EDGE HAY QUE REDESPLEGARLAS. `crear-miembro` valida el rango
--    contra su propia lista y repite la jerarquía, así que hasta que no se
--    redespliegan rechazan el alta de un secretario con «El rango indicado no
--    existe». Las dos importan el módulo común, así que van las dos:
--        npx supabase functions deploy crear-miembro --project-ref whmhunyqdtqjvaxxpyje
--        npx supabase functions deploy restablecer-contrasena --project-ref whmhunyqdtqjvaxxpyje
--
-- 4. EL PRIMER SECRETARIO LO DA DE ALTA EL COMANDANTE, desde la web, en
--    /enlace. Nadie más puede: los cargos de Junta no se nombran a sí mismos ni
--    entre ellos. No hace falta tocar el panel de Supabase.
