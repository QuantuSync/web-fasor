-- ============================================================================
-- FASOR, zona interna (/enlace)
-- Eliminación de mensajes y de avisos, cada uno por su lado.
--
-- Dónde se ejecuta: Supabase Dashboard, SQL Editor del proyecto.
-- Se ejecuta DESPUÉS de 03_buzon_mensajes.sql. Es idempotente: añade columnas
-- con `add column if not exists`, reemplaza la función de protecciones y vuelve
-- a crear los triggers y las políticas que toca.
--
-- ----------------------------------------------------------------------------
-- QUÉ AÑADE, Y CUÁL ES LA REGLA
-- ----------------------------------------------------------------------------
-- Archivar aparta un mensaje de la bandeja. Eliminar lo quita para siempre,
-- pero SOLO DE LA VISTA DE QUIEN ELIMINA.
--
--   * Si el destinatario elimina un mensaje, el remitente lo conserva en
--     Enviados. Y al revés.
--   * Nadie puede hacer desaparecer un mensaje del buzón de otra persona. Eso
--     no lo garantiza la pantalla, lo garantiza el trigger de la sección 3.
--   * La eliminación no tiene vuelta atrás. Tampoco por la vía de volver a
--     poner la columna en falso, que el trigger rechaza.
--
-- De ahí la forma: dos columnas, una por lado, hermanas de las de archivado que
-- ya existen. Mientras una de las dos partes conserve el mensaje, la fila tiene
-- que seguir ahí, porque esa copia es suya.
--
-- ----------------------------------------------------------------------------
-- POR QUÉ LA FILA SE BORRA DE VERDAD CUANDO LAS DOS PARTES LA ELIMINAN
-- ----------------------------------------------------------------------------
-- La regla es una sola y se puede decir en una frase: la fila vive exactamente
-- mientras alguien pueda verla.
--
-- Cuando las dos partes lo han eliminado, ya no hay nadie que pueda leer ese
-- mensaje nunca más. Conservar entonces el asunto y el cuerpo sería guardar el
-- contenido de una comunicación privada que ni siquiera sus dos autores pueden
-- consultar, y a quien se le prometió que eliminar era permanente. Es lo
-- contrario de la minimización de datos, y añade una responsabilidad sin
-- ninguna utilidad a cambio. Así que un trigger la borra (sección 4).
--
-- Con los avisos ocurre lo mismo pero con una sola parte: un aviso solo lo ve
-- su mando, de modo que en cuanto él lo elimina ya no hay nadie que pueda
-- verlo. Por eso ahí no hacen falta columnas ni purga: se borra la fila
-- directamente, con una política de borrado que lo limita a su propio mando
-- (sección 5). Misma regla, un solo interesado.
--
-- Consecuencia buscada: `mensajes` sigue teniendo prohibido el DELETE desde el
-- cliente. La purga la hace el servidor y solo cuando se cumple la condición.
-- ============================================================================


-- ============================================================================
-- 0. REQUISITOS PREVIOS
-- ============================================================================
do $$
begin
  if to_regclass('public.mensajes') is null or to_regclass('public.avisos_cadena') is null then
    raise exception 'FASOR: faltan las tablas del buzón. Ejecuta antes 03_buzon_mensajes.sql.';
  end if;
end
$$;


-- ============================================================================
-- 1. LAS COLUMNAS DE ELIMINACIÓN
-- ============================================================================
-- Hermanas de `archivado_remitente` y `archivado_destinatario`, y con el mismo
-- criterio: se añaden opcionales por si la tabla ya tuviera filas, y se marcan
-- obligatorias después, cuando ya no queda ningún nulo.
alter table public.mensajes add column if not exists eliminado_remitente boolean;
alter table public.mensajes add column if not exists eliminado_destinatario boolean;

do $$
declare
  columna text;
begin
  foreach columna in array array['eliminado_remitente', 'eliminado_destinatario'] loop
    execute format('alter table public.mensajes alter column %I set default false', columna);
    execute format('update public.mensajes set %I = false where %I is null', columna, columna);
    execute format('alter table public.mensajes alter column %I set not null', columna);
  end loop;
exception when others then
  raise warning 'FASOR: no se han podido dejar obligatorias las columnas de eliminación (%). Revísalas a mano.', sqlerrm;
end
$$;

-- Las consultas del buzón filtran siempre por estas columnas, así que se suman
-- a los índices que ya orientan la bandeja y los enviados.
do $$
declare
  sentencia text;
begin
  foreach sentencia in array array[
    'create index if not exists mensajes_bandeja_idx on public.mensajes (destinatario, eliminado_destinatario, creado_en desc)',
    'create index if not exists mensajes_enviados_idx on public.mensajes (remitente, eliminado_remitente, creado_en desc)'
  ] loop
    begin
      execute sentencia;
    exception when others then
      raise warning 'FASOR: no se ha podido crear un índice (%). No es grave, solo rendimiento.', sqlerrm;
    end;
  end loop;
end
$$;


-- ============================================================================
-- 2. AVISO SOBRE EL ARCHIVO 03
-- ============================================================================
-- La función `mensajes_protecciones()` del archivo 03 no conoce estas dos
-- columnas. Como solo blinda las que enumera, un remitente podría cambiar la
-- eliminación del destinatario y hacerle desaparecer el mensaje de su bandeja,
-- que es justo lo que no puede ocurrir.
--
-- Por eso la sección 3 REEMPLAZA esa función entera. No ejecutes el 03 después
-- de este archivo; si alguna vez lo haces, vuelve a ejecutar este a
-- continuación.


-- ============================================================================
-- 3. PROTECCIONES DE `mensajes`, VERSIÓN COMPLETA
-- ============================================================================
-- Reemplaza a la del 03 y le añade las dos reglas nuevas. El resto es idéntico,
-- se repite entero a propósito para que la función se lea de una vez y no haya
-- que reconstruirla mentalmente entre dos archivos.
--
-- Misma lección que el archivo 02: las condiciones son siempre verdaderas o
-- falsas, NUNCA NULL (`actor is not null and ...`), y se falla CERRADO. Si no
-- se sabe quién actúa, el cambio no pasa. La vía de rescate sigue siendo
-- desactivar el trigger dentro de una transacción, no debilitar la regla.
create or replace function public.mensajes_protecciones()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
begin
  if new.id is distinct from old.id
     or new.remitente is distinct from old.remitente
     or new.destinatario is distinct from old.destinatario
     or new.asunto is distinct from old.asunto
     or new.cuerpo is distinct from old.cuerpo
     or new.creado_en is distinct from old.creado_en
     or new.hilo is distinct from old.hilo
     or new.responde_a is distinct from old.responde_a then
    raise exception 'Un mensaje enviado no se modifica.';
  end if;

  if new.leido_en is distinct from old.leido_en
     and not (actor is not null and actor = old.destinatario) then
    raise exception 'Solo el destinatario marca un mensaje como leído.';
  end if;

  if new.archivado_destinatario is distinct from old.archivado_destinatario
     and not (actor is not null and actor = old.destinatario) then
    raise exception 'Solo el destinatario archiva un mensaje recibido.';
  end if;

  if new.archivado_remitente is distinct from old.archivado_remitente
     and not (actor is not null and actor = old.remitente) then
    raise exception 'Solo el remitente archiva un mensaje enviado.';
  end if;

  -- ---- Eliminación, cada uno por su lado --------------------------------
  -- Un remitente no toca la eliminación del destinatario, ni al revés. Esta es
  -- la regla que impide hacer desaparecer un mensaje del buzón de otro.
  if new.eliminado_destinatario is distinct from old.eliminado_destinatario
     and not (actor is not null and actor = old.destinatario) then
    raise exception 'Solo el destinatario puede eliminar un mensaje de su bandeja.';
  end if;

  if new.eliminado_remitente is distinct from old.eliminado_remitente
     and not (actor is not null and actor = old.remitente) then
    raise exception 'Solo el remitente puede eliminar un mensaje de sus enviados.';
  end if;

  -- Eliminar no tiene vuelta atrás, y eso también significa que la columna no
  -- se puede devolver a falso para resucitar el mensaje.
  if old.eliminado_destinatario is true and new.eliminado_destinatario is not true then
    raise exception 'Un mensaje eliminado no se puede recuperar.';
  end if;

  if old.eliminado_remitente is true and new.eliminado_remitente is not true then
    raise exception 'Un mensaje eliminado no se puede recuperar.';
  end if;

  return new;
end
$$;

drop trigger if exists mensajes_protecciones on public.mensajes;
create trigger mensajes_protecciones
before update on public.mensajes
for each row
execute function public.mensajes_protecciones();


-- ============================================================================
-- 4. LA PURGA, CUANDO YA NO PUEDE VERLO NADIE
-- ============================================================================
-- Se dispara solo si las DOS partes lo han eliminado. Va `after update` para
-- que el UPDATE termine su trabajo (y devuelva su fila al cliente) antes de que
-- la fila desaparezca.
--
-- Los mensajes que respondían a este no se pierden: `responde_a` se declaró con
-- `on delete set null`, y `hilo` no es clave ajena, así que la conversación
-- sigue entera para quien la conserve.
create or replace function public.mensajes_purga()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.eliminado_remitente is true and new.eliminado_destinatario is true then
    delete from public.mensajes where id = new.id;
  end if;
  return null;
end
$$;

drop trigger if exists mensajes_purga on public.mensajes;
create trigger mensajes_purga
after update on public.mensajes
for each row
execute function public.mensajes_purga();


-- ============================================================================
-- 5. ELIMINAR UN AVISO
-- ============================================================================
-- Un aviso solo lo ve su mando, así que en cuanto él lo elimina no queda nadie
-- que pueda verlo. No hacen falta columnas ni purga, se borra la fila.
--
-- Esta es la ÚNICA política de borrado de todo el esquema, y está limitada a
-- las filas propias del mando. `mensajes` sigue sin ninguna, porque allí hay
-- dos interesados y el borrado lo decide el servidor en la sección 4.
drop policy if exists "avisos_cadena_borrado" on public.avisos_cadena;
create policy "avisos_cadena_borrado"
on public.avisos_cadena
for delete
to authenticated
using (
  public.mi_rango() is not null
  and mando = auth.uid()
);

grant delete on public.avisos_cadena to authenticated;


-- ============================================================================
-- 6. COMPROBACIONES
-- ============================================================================
-- ---------------------------------------------------------------------------
-- (a) Las columnas nuevas
-- ---------------------------------------------------------------------------
-- Deben salir las dos, boolean, `not null` y con `false` por defecto:
--
--     select column_name, data_type, is_nullable, column_default
--       from information_schema.columns
--      where table_schema = 'public' and table_name = 'mensajes'
--        and column_name in ('eliminado_remitente', 'eliminado_destinatario');
--
-- ---------------------------------------------------------------------------
-- (b) Las políticas de borrado
-- ---------------------------------------------------------------------------
-- Debe salir UNA sola fila, avisos_cadena_borrado. Si apareciera alguna sobre
-- `mensajes`, hay que quitarla: allí el borrado lo decide el trigger de purga.
--
--     select tablename, policyname, cmd from pg_policies
--      where schemaname = 'public' and cmd = 'DELETE'
--        and tablename in ('mensajes', 'avisos_cadena');
--
-- ---------------------------------------------------------------------------
-- (c) Nadie elimina por el lado del otro
-- ---------------------------------------------------------------------------
-- Con la identidad del REMITENTE, intentar eliminar por el lado del
-- destinatario tiene que fallar. TODO EL BLOQUE ACABA EN ROLLBACK.
--
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DEL-REMITENTE','role','authenticated')::text, true);
--
--       -- Debe FALLAR con «Solo el destinatario puede eliminar un mensaje de su bandeja.»
--       update public.mensajes set eliminado_destinatario = true where id = 'UUID-DEL-MENSAJE';
--     rollback;
--
-- Y por su propio lado debe funcionar:
--
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DEL-REMITENTE','role','authenticated')::text, true);
--       update public.mensajes set eliminado_remitente = true where id = 'UUID-DEL-MENSAJE';
--       -- Sigue existiendo, porque el destinatario lo conserva:
--       reset role;
--       select id, eliminado_remitente, eliminado_destinatario from public.mensajes
--        where id = 'UUID-DEL-MENSAJE';
--     rollback;
--
-- ---------------------------------------------------------------------------
-- (d) La purga
-- ---------------------------------------------------------------------------
-- Eliminando por los dos lados, la fila tiene que desaparecer. Aquí se hace sin
-- `set local role`, como dueño de la tabla, para ver la purga aislada del
-- reparto de permisos. TODO EL BLOQUE ACABA EN ROLLBACK.
--
--     begin;
--       update public.mensajes
--          set eliminado_remitente = true, eliminado_destinatario = true
--        where id = 'UUID-DEL-MENSAJE';
--       -- Debe devolver CERO filas:
--       select count(*) from public.mensajes where id = 'UUID-DEL-MENSAJE';
--     rollback;
--
-- ---------------------------------------------------------------------------
-- (e) Eliminar no se deshace
-- ---------------------------------------------------------------------------
--     begin;
--       update public.mensajes set eliminado_remitente = true where id = 'UUID-DEL-MENSAJE';
--       -- Debe FALLAR con «Un mensaje eliminado no se puede recuperar.»
--       update public.mensajes set eliminado_remitente = false where id = 'UUID-DEL-MENSAJE';
--     rollback;


-- ============================================================================
-- 7. ADVERTENCIAS
-- ============================================================================
-- 1. NO VUELVAS A EJECUTAR EL 03 DESPUÉS DE ESTE ARCHIVO sin ejecutar después
--    este otra vez. El 03 reinstala su versión de `mensajes_protecciones()`,
--    que no conoce las columnas de eliminación y dejaría sin blindar el lado
--    del otro. Está dicho también en la sección 2.
--
-- 2. Si el bloque de la sección 1 avisa de que no ha podido dejar obligatorias
--    las columnas, quedarán opcionales. No es un agujero (el valor por defecto
--    es `false` y las consultas filtran por igualdad), pero conviene revisarlo:
--        select count(*) from public.mensajes
--         where eliminado_remitente is null or eliminado_destinatario is null;
--
-- 3. La purga borra la fila de verdad. No hay papelera ni copia de seguridad
--    propia del buzón más allá de las que haga Supabase del proyecto entero. Es
--    exactamente lo que se le promete al miembro en la pantalla y en la
--    política de privacidad, y por eso la confirmación de eliminar es en dos
--    pasos.
