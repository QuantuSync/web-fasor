-- ============================================================================
-- FASOR, zona interna (/enlace)
-- Baja real, borra la cuenta y todo lo asociado, no la desactiva.
--
-- Dónde se ejecuta: Supabase Dashboard, SQL Editor del proyecto (o la CLI de
-- Supabase, `supabase db query --linked --file supabase/sql/12_eliminacion_real_de_miembros.sql`).
-- Se ejecuta DESPUÉS de `11_autorizar_nuevo_examen.sql`. Es idempotente.
--
-- ----------------------------------------------------------------------------
-- QUÉ CAMBIA Y POR QUÉ
-- ----------------------------------------------------------------------------
-- Hasta ahora «dar de baja» ponía `activo = false`, la cuenta seguía
-- existiendo. Se sustituye por un borrado de verdad, cuenta, perfil, mensajes,
-- avisos de cadena y exámenes, sin dejar rastro. El borrado en sí lo hace una
-- función Edge nueva (`eliminar-miembro`, exige la clave de servicio, ver
-- README de la sección 4 más abajo); este archivo deja la base de datos lista
-- para que ese borrado se pueda hacer sin romper nada.
--
-- ----------------------------------------------------------------------------
-- QUÉ ARRASTRA CADA CLAVE AJENA, REVISADO ANTES DE TOCAR NADA
-- ----------------------------------------------------------------------------
-- `perfiles.id` referencia a `auth.users(id) on delete cascade`. Esto es lo
-- que hace que borrar la cuenta (`auth.admin.deleteUser`, en la función Edge)
-- sea lo que hay que borrar, no el perfil directamente, borrar solo el
-- perfil dejaría una cuenta huérfana que todavía podría iniciar sesión.
--
-- Borrar `auth.users` cae en cascada, por las claves ya existentes:
--   mensajes.remitente              on delete cascade
--   mensajes.destinatario           on delete cascade
--   avisos_cadena.remitente         on delete cascade
--   avisos_cadena.mando             on delete cascade
--   avisos_cadena.destinatario      on delete cascade
--   destinatarios.destinatario      on delete cascade  (tabla sin uso, igual)
--   examenes.aspirante_id           on delete cascade
--   examen_autorizaciones.aspirante_id  on delete cascade
--
-- Con dos EXCEPCIONES que había que corregir, sin `on delete` ninguno, que
-- por defecto en Postgres es `NO ACTION`, bloquea el borrado con un error de
-- clave ajena en cuanto la persona borrada aparece ahí:
--
--   examenes.ratificado_por             (quién ratificó, no de quién es el examen)
--   examen_autorizaciones.autorizado_por (quién autorizó, no de quién es la autorización)
--
-- Las dos apuntan a EL MANDO, no al aspirante dueño de la fila. Un `cascade`
-- ahí sería el error contrario, borraría el examen de OTRA persona (el
-- aspirante) solo porque el mando que lo ratificó o autorizó se ha ido de la
-- entidad. Lo correcto es `set null`, el examen y la autorización se
-- conservan enteros, y sencillamente queda constancia de que ya no se sabe
-- quién fue (la persona que lo hizo ya no existe). Comprobado con datos
-- reales, el examen del aspirante de pruebas está ratificado por el
-- comandante real; sin este archivo, borrar al comandante habría fallado con
-- una violación de clave ajena.
--
-- `examen_autorizaciones.autorizado_por` se declaró `not null` en el `11`,
-- así que antes de poder ponerle `set null` hay que quitarle esa restricción.
--
-- «QUÉ SE BORRA», tal cual se pidió, mensajes, avisos de cadena y exámenes
-- del PROPIO aspirante o miembro. Los exámenes ajenos que haya ratificado o
-- autorizado como mando NO se borran, se quedan sin autor.
--
-- ----------------------------------------------------------------------------
-- AVISO IMPORTANTE SOBRE LOS MENSAJES, PARA QUE QUEDE DICHO
-- ----------------------------------------------------------------------------
-- Un mensaje es UNA fila compartida por remitente y destinatario (no dos
-- copias). Si se borra a cualquiera de los dos, la fila entera desaparece, se
-- lleva por delante también la copia de la OTRA persona, aunque esa otra
-- persona no haya pedido borrar nada y siga en la entidad. Es una consecuencia
-- directa de pedir un borrado real y de que el buzón no duplica el mensaje
-- por cada lado; no hay forma de borrar solo la cuenta de una persona y
-- conservar sus mensajes para quien hablara con ella.
--
-- ----------------------------------------------------------------------------
-- EL TRIGGER DEL `02`, REVISADO PARA EL BORRADO
-- ----------------------------------------------------------------------------
-- `perfiles_protecciones()` (última versión, del `05`) ya tenía una rama para
-- `tg_op = 'DELETE'` que calcula `pierde_el_mando` con la misma regla que la
-- de `UPDATE`, y el trigger `perfiles_protecciones_borrado` (`before delete`)
-- ya estaba instalado. Es decir, LA REGLA DEL ÚLTIMO COMANDANTE YA CUBRÍA EL
-- BORRADO, sin cambios, porque es incondicional (no mira quién llama, ver el
-- propio `02`).
--
-- Lo que esa rama NO comprobaba es que nadie se borre a sí mismo. Se añade
-- aquí, con el mismo cuidado de siempre (`actor is not null and ...`, nunca
-- depende de un NULL). Dicho esto, y para que quede claro por qué el borrado
-- no puede apoyarse en `puede_gestionar()` como hace `UPDATE`, el borrado de
-- verdad lo hace `auth.admin.deleteUser()` desde la función Edge, con la
-- CLAVE DE SERVICIO, así que cuando este trigger se dispara por la cascada,
-- `auth.uid()` vale NULL, no hay una sesión de usuario detrás de esa llamada.
-- Por eso:
--   * la comprobación de «no te borres a ti mismo» que se añade aquí, aunque
--     correcta, nunca se va a disparar por la vía normal (siempre es NULL en
--     ese momento); queda como red de seguridad para el día que alguien,
--     por error, conceda DELETE a `authenticated` sobre `perfiles` (hoy no
--     lo tiene, ver sección 3).
--   * NO se añade aquí ninguna comprobación de jerarquía (si `mi_rango()`
--     puede gestionar al objetivo). Añadirla sería peor que no tenerla,
--     `mi_rango()` también depende de `auth.uid()`, así que con NULL
--     `puede_gestionar()` da `false` SIEMPRE, y esa comprobación bloquearía
--     el único camino legítimo de borrado (la función Edge) en lugar de
--     protegerlo.
--   * Por eso «nadie se borra a sí mismo», «secretario y tesorero no borran
--     a un comandante ni entre ellos» y «solo comandante, secretario y
--     tesorero, nunca capitán» se comprueban ENTERAS en la función Edge
--     `eliminar-miembro` (sección 4), con el perfil de quien llama
--     recalculado desde su propio JWT, exactamente igual que ya hace
--     `crear-miembro`. Es la única vía por la que se puede borrar de verdad,
--     no hay política de DELETE en `perfiles` (ver sección 3) que dé un
--     segundo camino que proteger.
-- ============================================================================


-- ============================================================================
-- 1. `examenes.ratificado_por`, `set null` en vez de bloquear el borrado
-- ============================================================================
alter table public.examenes drop constraint if exists examenes_ratificado_por_fkey;
alter table public.examenes
  add constraint examenes_ratificado_por_fkey
  foreign key (ratificado_por) references public.perfiles(id) on delete set null;


-- ============================================================================
-- 2. `examen_autorizaciones.autorizado_por`, lo mismo, y antes quitarle el
--    `not null` que le puso el `11` (con `set null` no pueden convivir)
-- ============================================================================
alter table public.examen_autorizaciones alter column autorizado_por drop not null;

alter table public.examen_autorizaciones drop constraint if exists examen_autorizaciones_autorizado_por_fkey;
alter table public.examen_autorizaciones
  add constraint examen_autorizaciones_autorizado_por_fkey
  foreign key (autorizado_por) references public.perfiles(id) on delete set null;


-- ============================================================================
-- 3. SIGUE SIN HABER POLÍTICA DE DELETE EN `perfiles`, A PROPÓSITO
-- ============================================================================
-- No se añade ninguna. El borrado de verdad pasa siempre por la función Edge
-- (clave de servicio, que no pasa por RLS), nunca por un cliente autenticado
-- normal; que `authenticated` no tenga ni política ni grant de DELETE es lo
-- que garantiza que no hay una segunda vía. Se deja constancia explícita, con
-- un `revoke` que no debería hacer falta (ya era así) pero que no está de más
-- decir en voz alta.
revoke delete on public.perfiles from anon, authenticated;


-- ============================================================================
-- 4. `perfiles_protecciones()`, AÑADE EL AUTOBORRADO A LA RAMA DE DELETE
-- ============================================================================
-- Se repite entera (verbatim salvo la línea señalada), mismo criterio que el
-- resto de este esquema.
create or replace function public.perfiles_protecciones()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  -- Quién está actuando. null si no hay sesión de usuario (clave de
  -- servicio, SQL Editor, o el borrado real desde la función Edge). Se
  -- guarda en una variable para que se lea una sola vez.
  actor uuid := auth.uid();
  -- Si esta operación le quita el mando a un comandante activo
  pierde_el_mando boolean;
  comandantes_restantes integer;
begin
  if tg_op = 'DELETE' then
    -- Nadie se elimina a sí mismo. `actor is not null` va delante a
    -- propósito, misma disciplina de siempre: si no se sabe quién actúa (el
    -- caso normal del borrado real, ver cabecera de este archivo), esta
    -- comprobación no se dispara, no es la vía por la que se protege eso,
    -- lo hace la función Edge `eliminar-miembro` con la identidad real de
    -- quien llama.
    if actor is not null and old.id = actor then
      raise exception 'No puedes eliminarte a ti mismo.';
    end if;

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
-- 5. COMPROBACIONES
-- ============================================================================
-- (a) Las dos claves ajenas ya son `set null`
-- ---------------------------------------------------------------------------
--     select conname, pg_get_constraintdef(oid) from pg_constraint
--      where conname in ('examenes_ratificado_por_fkey', 'examen_autorizaciones_autorizado_por_fkey');
--
--   Las dos deben terminar en `ON DELETE SET NULL`.
--
-- (b) `autorizado_por` ya admite NULL
-- ---------------------------------------------------------------------------
--     select is_nullable from information_schema.columns
--      where table_name = 'examen_autorizaciones' and column_name = 'autorizado_por';
--
-- (c) El borrado en cascada de verdad, con datos reales, dentro de un
--     ROLLBACK que lo deshace todo
-- ---------------------------------------------------------------------------
-- Necesita un aspirante real con al menos un examen. Antes y después del
-- borrado real de `auth.users`, para ver que arrastra perfiles y exámenes.
--
--     begin;
--       select
--         (select count(*) from perfiles where id = 'UUID-DEL-ASPIRANTE') as perfiles_antes,
--         (select count(*) from examenes where aspirante_id = 'UUID-DEL-ASPIRANTE') as examenes_antes;
--
--       delete from auth.users where id = 'UUID-DEL-ASPIRANTE';
--
--       select
--         (select count(*) from perfiles where id = 'UUID-DEL-ASPIRANTE') as perfiles_despues,
--         (select count(*) from examenes where aspirante_id = 'UUID-DEL-ASPIRANTE') as examenes_despues;
--     rollback;
--
--   `_antes` con datos, `_despues` los dos en cero.
--
-- (d) Borrar al mando que ratificó un examen NO borra el examen del
--     aspirante, solo desvincula `ratificado_por`
-- ---------------------------------------------------------------------------
-- Necesita un examen real corregido por un mando real que se pueda borrar sin
-- dejar a la entidad sin comandante (o hazlo con un teniente/capitán si hay
-- alguno). TODO DENTRO DE UN ROLLBACK.
--
--     begin;
--       select id, ratificado_por from examenes where id = 'UUID-DEL-EXAMEN';
--       delete from auth.users where id = 'UUID-DEL-MANDO-QUE-RATIFICO';
--       -- El examen sigue existiendo, con ratificado_por en null
--       select id, ratificado_por from examenes where id = 'UUID-DEL-EXAMEN';
--     rollback;
--
-- (e) Nadie se borra a sí mismo, probado con identidad simulada y SIN el rol
--     `authenticated` (para aislar el trigger de la política, que de todas
--     formas no dejaría llegar hasta aquí)
-- ---------------------------------------------------------------------------
--     begin;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DE-CUALQUIERA','role','authenticated')::text, true);
--       -- Debe FALLAR con «No puedes eliminarte a ti mismo.»
--       delete from perfiles where id = 'UUID-DE-CUALQUIERA';
--     rollback;
--
-- (f) El último comandante sigue blindado también para DELETE
-- ---------------------------------------------------------------------------
--     begin;
--       delete from perfiles where id = (select id from perfiles where rango='comandante' and activo limit 1);
--     rollback;
--
--   Con un solo comandante activo, debe FALLAR con «No puedes dejar a la
--   entidad sin ningún comandante activo...».
--
-- (g) `authenticated` no tiene ni política ni grant de DELETE sobre `perfiles`
-- ---------------------------------------------------------------------------
--     select count(*) from pg_policies where schemaname='public' and tablename='perfiles' and cmd='DELETE';
--     select grantee, privilege_type from information_schema.role_table_grants
--      where table_name='perfiles' and privilege_type='DELETE' and grantee in ('anon','authenticated');
--
--   Las dos deben devolver CERO filas. El grant SÍ existe para `service_role`
--   y para `postgres` (el dueño de la tabla), y así tiene que ser, son los
--   únicos dos que legítimamente pueden borrar; si la segunda consulta no
--   acota `grantee`, verás esos dos y no es un fallo.
