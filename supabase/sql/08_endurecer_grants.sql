-- ============================================================================
-- FASOR, zona interna (/enlace)
-- Endurecer los privilegios de tabla de perfiles, mensajes, avisos_cadena,
-- destinatarios y la vista directorio.
--
-- Dónde se ejecuta: Supabase Dashboard, SQL Editor del proyecto (o la CLI de
-- Supabase, `supabase db query --linked --file supabase/sql/08_endurecer_grants.sql`).
-- No depende de ningún archivo anterior y no modifica ninguno de ellos, así
-- que se puede ejecutar en cualquier momento después del `05`. Es idempotente,
-- cada bloque es `revoke all` seguido de un `grant` exacto, así que repetirlo
-- dos veces deja el mismo resultado.
--
-- ----------------------------------------------------------------------------
-- POR QUÉ ESTE ARCHIVO EXISTE
-- ----------------------------------------------------------------------------
-- Al aplicar `07_examen_ingreso.sql` (11 de septiembre de 2026) se descubrió
-- que Supabase concede por defecto TODOS los privilegios de tabla a `anon` y
-- a `authenticated` en cuanto se crea una relación en `public`. Los archivos
-- `01` a `05` revocaban de `anon` pero no de `authenticated` antes de conceder
-- lo estrecho, y un `grant` nunca retira lo que ya había, solo añade. El
-- resultado, comprobado en la base real, `perfiles` tenía hasta `delete`
-- concedido a `anon`, y `authenticated` tenía `references`/`trigger`/
-- `truncate` de sobra en las cuatro tablas y, en la vista `directorio`,
-- hasta `insert`/`update`/`delete`.
--
-- ESO ÚLTIMO NO ERA COSMÉTICO. Se comprobó en vivo (dentro de una transacción
-- que acabó en `rollback`, nada quedó escrito) que un secretario, a quien
-- `puede_gestionar()` prohíbe tocar a un comandante de cualquier forma, podía
-- ejecutar `update directorio set nombre = ... where id = <el comandante>` y
-- que se aplicaba de verdad. La vista, al no declarar `security_invoker`, se
-- evalúa con los permisos de su DUEÑO para todo lo que toca `perfiles`,
-- exactamente el mecanismo por el que ya bypassea a propósito la lectura
-- estrecha de `perfiles_lectura` (ver `03_buzon_mensajes.sql`, sección 4). Ese
-- mismo bypass, con un `grant update` de sobra encima, se llevaba por delante
-- también `perfiles_edicion` para cualquier miembro activo. El trigger
-- `perfiles_protecciones` seguía bloqueando los casos que mira (rango propio,
-- alta propia, último comandante), porque los triggers se disparan siempre
-- sobre la tabla base y no dependen de RLS ni de la vista, pero no cubre
-- «edito la ficha de otro que no me corresponde», que es exactamente lo que
-- `perfiles_edicion` existe para impedir.
--
-- La regla de este archivo, `revoke all` a los DOS roles primero, y luego un
-- `grant` con exactamente lo que cada tabla necesita, ni un privilegio más.
-- Lo que necesita cada una sale de sus políticas RLS vigentes y de lo que el
-- código del sitio le pide de verdad, repasado antes de escribir esto:
--
--   perfiles       SELECT, INSERT, UPDATE   (sin DELETE, las cuentas no se
--                  borran nunca, se dan de baja con `activo = false`)
--   mensajes       SELECT, INSERT, UPDATE   (sin DELETE, el borrado de
--                  verdad lo hace el trigger `mensajes_purga`, que al ser
--                  `security definer` no necesita el grant)
--   avisos_cadena  SELECT, UPDATE, DELETE   (sin INSERT, los avisos los crea
--                  solo el trigger `mensajes_aviso_cadena`, también
--                  `security definer`)
--   destinatarios  NADA. Tabla sin uso desde que un mensaje va a un único
--                  destinatario (ver `03_buzon_mensajes.sql`, ADVERTENCIAS
--                  punto 5); comprobado, 0 filas. Conserva sus propias
--                  políticas de una implementación anterior del buzón, que
--                  este archivo no toca (no le corresponde), pero sin ningún
--                  privilegio de tabla esas políticas no se llegan a evaluar
--                  nunca, así que quedan inertes.
--   directorio     SELECT únicamente. Es la corrección que cierra el hueco
--                  de más arriba.
--
-- `anon` no necesita nada en ninguna de las cinco, toda la zona interna
-- exige sesión.
-- ============================================================================


-- ============================================================================
-- 1. `perfiles`
-- ============================================================================
revoke all on public.perfiles from anon, authenticated;
grant select, insert, update on public.perfiles to authenticated;


-- ============================================================================
-- 2. `mensajes`
-- ============================================================================
revoke all on public.mensajes from anon, authenticated;
grant select, insert, update on public.mensajes to authenticated;


-- ============================================================================
-- 3. `avisos_cadena`
-- ============================================================================
revoke all on public.avisos_cadena from anon, authenticated;
grant select, update, delete on public.avisos_cadena to authenticated;


-- ============================================================================
-- 4. `destinatarios`
-- ============================================================================
revoke all on public.destinatarios from anon, authenticated;
-- Sin ningún grant de vuelta, a propósito.


-- ============================================================================
-- 5. `directorio`
-- ============================================================================
revoke all on public.directorio from anon, authenticated;
grant select on public.directorio to authenticated;


-- ============================================================================
-- 6. COMPROBACIONES
-- ============================================================================
-- (a) El resultado final, exactamente esto y nada más
-- ---------------------------------------------------------------------------
--     select table_name, grantee, string_agg(privilege_type, ',' order by privilege_type)
--       from information_schema.role_table_grants
--      where table_name in ('perfiles','mensajes','avisos_cadena','destinatarios','directorio')
--        and grantee in ('anon','authenticated')
--      group by table_name, grantee
--      order by table_name, grantee;
--
--   Debe salir exactamente:
--     avisos_cadena / authenticated   -> DELETE,SELECT,UPDATE
--     directorio    / authenticated   -> SELECT
--     mensajes      / authenticated   -> INSERT,SELECT,UPDATE
--     perfiles      / authenticated   -> INSERT,SELECT,UPDATE
--   Y ninguna fila para `destinatarios`, ni ninguna para `anon` en ninguna.
--
-- (b) El hueco de `directorio` queda cerrado
-- ---------------------------------------------------------------------------
-- Con la identidad de un secretario real, intentar tocar al comandante a
-- través de la vista debe fallar por falta de permiso, no por la política.
-- TODO EL BLOQUE ACABA EN ROLLBACK.
--
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DEL-SECRETARIO','role','authenticated')::text, true);
--       -- Debe fallar con «permission denied for view directorio»
--       update directorio set nombre = nombre where id = 'UUID-DEL-COMANDANTE';
--     rollback;
--
-- (c) La zona interna sigue funcionando
-- ---------------------------------------------------------------------------
-- Entrar, listar miembros y enviar un mensaje, con una cuenta real de cada
-- cosa. Si algo de esto falla después de aplicar este archivo, hay que
-- revisar si a alguna tabla le faltó un privilegio que sí usaba.


-- ============================================================================
-- 7. ADVERTENCIAS
-- ============================================================================
-- 1. NO ARREGLA LA POLÍTICA «ver perfiles activos». Al inventariar
--    `perfiles` para este archivo apareció una política de lectura
--    (`to authenticated`, `using (activo)`) que no está en ningún archivo
--    `01` a `06`, resto de una versión anterior del esquema. Como las
--    políticas permisivas se combinan con OR, mientras siga ahí, cualquier
--    miembro activo puede leer el perfil completo de cualquier otro activo
--    por la tabla `perfiles` directamente, sin pasar por el recorte de
--    `perfiles_lectura` (comandante ve a todos, capitán solo su unidad,
--    etc.). No expone nada a quien no tiene sesión, y no es una columna más
--    de las que ya expone `directorio` a propósito, pero deshace el recorte
--    por rango que `perfiles_lectura` está pensada para aplicar. Este
--    archivo no la toca porque tocar una política, y no un grant, es una
--    decisión distinta a la que pidió este archivo. Para quitarla,
--    `drop policy if exists "ver perfiles activos" on public.perfiles;`.
--
-- 2. `destinatarios` conserva sus tres políticas de una implementación
--    anterior del buzón (`ver destinatarios relevantes`, `asignar
--    destinatarios permitidos`, `actualizar lo propio`), que referencian una
--    función `puedo_escribir_a()`. No se tocan aquí, igual que el `03` no
--    tocó la tabla; sin ningún privilegio concedido quedan inertes, nadie
--    llega a que se evalúen.
