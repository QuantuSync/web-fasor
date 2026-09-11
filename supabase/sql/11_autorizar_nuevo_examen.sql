-- ============================================================================
-- FASOR, zona interna (/enlace)
-- Autorización expresa del comandante para que un aspirante repita el
-- examen de ingreso, sea cual sea su resultado anterior.
--
-- Dónde se ejecuta: Supabase Dashboard, SQL Editor del proyecto (o la CLI de
-- Supabase, `supabase db query --linked --file supabase/sql/11_autorizar_nuevo_examen.sql`).
-- Se ejecuta DESPUÉS de `10_examen_respuestas_parciales.sql`. Es idempotente.
--
-- ----------------------------------------------------------------------------
-- QUÉ RESUELVE
-- ----------------------------------------------------------------------------
-- Hasta ahora, un aspirante con `no_apto_definitivo` no tenía ninguna vía para
-- repetir (el comunicado habla de «nueva convocatoria», pero no existía el
-- mecanismo), y uno con `no_apto_provisional` podía repetir sin que nadie lo
-- autorizara ni quedara constancia. Se añade una tabla nueva,
-- `examen_autorizaciones`, un registro de auditoría (quién, cuándo, por qué)
-- de cada excepción, y se amplía `examenes_antes_de_insertar()` para que la
-- respete, sin abrir ninguna otra vía.
--
-- ----------------------------------------------------------------------------
-- QUIÉN, CÓMO Y SOBRE QUÉ, EN SERVIDOR, NO EN LA INTERFAZ
-- ----------------------------------------------------------------------------
--   * Solo el comandante. Es una excepción a un resultado ya firmado y tiene
--     que tener un solo responsable; ni tenientes, ni capitanes, ni
--     secretario, ni tesorero. Comprobado en el trigger de la sección 2 con
--     `mi_rango()`, no en la pantalla, así que manipular el cliente no sirve
--     de nada.
--   * Solo sobre un aspirante que ya tiene un examen CORREGIDO. Sobre uno sin
--     examinar, o con uno pendiente de corrección, se rechaza.
--   * La autorización queda ligada al examen concreto que excepciona
--     (`examen_id`), no al aspirante en general, así que desbloquea
--     exactamente UN examen nuevo. Si ese nuevo examen también sale «no
--     apto», hace falta una autorización nueva para el siguiente, no hay
--     límite de intentos pero tampoco un cheque en blanco.
--   * `motivo` es obligatorio, `autorizado_por` y `autorizado_en` los pone el
--     trigger, nunca lo que mande el cliente, así que nadie se autoriza a sí
--     mismo ni firma en nombre de otro.
--   * El examen anterior no se toca, ni se borra ni se modifica. El nuevo,
--     cuando se envíe, es una fila aparte en `examenes`.
-- ============================================================================


-- ============================================================================
-- 1. `examen_autorizaciones`
-- ============================================================================
create table if not exists public.examen_autorizaciones (
  id uuid primary key default gen_random_uuid(),
  aspirante_id uuid not null references public.perfiles(id) on delete cascade,
  -- El examen corregido concreto que se excepciona. Fijado por el trigger de
  -- la sección 2, nunca por el cliente; es lo que hace que la autorización
  -- desbloquee un único examen nuevo y no un permiso permanente.
  examen_id uuid not null references public.examenes(id),
  autorizado_por uuid not null references public.perfiles(id),
  autorizado_en timestamptz not null default now(),
  motivo text not null,
  -- Para el aviso que ve el aspirante una sola vez, mismo patrón que
  -- `examenes.visto_por_aspirante_en`.
  visto_por_aspirante_en timestamptz
);

-- Como mucho una autorización por examen. Sin esto, nada lo impediría a nivel
-- de base de datos si el trigger de la sección 2 tuviera algún día un fallo;
-- con esto, ni con eso.
create unique index if not exists examen_autorizaciones_examen_unico
  on public.examen_autorizaciones (examen_id);

create index if not exists examen_autorizaciones_aspirante_idx
  on public.examen_autorizaciones (aspirante_id, autorizado_en desc);


-- ============================================================================
-- 2. LA AUTORIZACIÓN, AL INSERTAR
-- ============================================================================
-- Resuelve solo `aspirante_id` y `motivo` del cliente; todo lo demás
-- (`autorizado_por`, `autorizado_en`, `examen_id`) lo calcula esta función.
create or replace function public.examen_autorizaciones_antes_de_insertar()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  rango_aspirante public.rango;
  ultimo record;
begin
  if new.id is null then
    new.id := gen_random_uuid();
  end if;
  new.autorizado_en := now();

  -- Quién autoriza es quien está autenticado, nunca lo que mande el cliente.
  new.autorizado_por := auth.uid();

  -- Solo el comandante, comprobado aquí, en servidor. `is distinct from` para
  -- que un `mi_rango()` nulo (sin sesión válida) no cuele por accidente.
  if public.mi_rango() is distinct from 'comandante'::public.rango then
    raise exception 'Solo el comandante puede autorizar un nuevo examen.';
  end if;

  new.motivo := btrim(coalesce(new.motivo, ''));
  if new.motivo = '' then
    raise exception 'Autorizar un nuevo examen exige explicar el motivo.';
  end if;

  select p.rango into rango_aspirante from public.perfiles p where p.id = new.aspirante_id;
  if rango_aspirante is distinct from 'aspirante' then
    raise exception 'Solo se puede autorizar a quien sigue siendo aspirante.';
  end if;

  -- El último examen del aspirante, sea cual sea su resultado.
  select e.id, e.estado into ultimo
    from public.examenes e
   where e.aspirante_id = new.aspirante_id
   order by e.creado_en desc
   limit 1;

  if ultimo.id is null then
    raise exception 'Este aspirante todavía no tiene ningún examen que excepcionar.';
  end if;
  if ultimo.estado is distinct from 'corregido' then
    raise exception 'Solo se puede autorizar un nuevo examen sobre uno ya corregido.';
  end if;
  if exists (select 1 from public.examen_autorizaciones a where a.examen_id = ultimo.id) then
    raise exception 'Ya hay una autorización para el último examen de este aspirante.';
  end if;

  new.examen_id := ultimo.id;
  new.visto_por_aspirante_en := null;

  return new;
end
$$;

drop trigger if exists examen_autorizaciones_antes_de_insertar on public.examen_autorizaciones;
create trigger examen_autorizaciones_antes_de_insertar
before insert on public.examen_autorizaciones
for each row
execute function public.examen_autorizaciones_antes_de_insertar();


-- ============================================================================
-- 3. LO QUE RLS NO PUEDE VER, SOLO EL ASPIRANTE MARCA VISTO
-- ============================================================================
-- Es un registro de auditoría, nadie lo modifica salvo el propio aspirante
-- para marcarlo visto, una sola vez y sin poder deshacerlo, mismo patrón que
-- `examenes_protecciones`.
create or replace function public.examen_autorizaciones_protecciones()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
begin
  if actor is not null and actor = old.aspirante_id then
    if old.visto_por_aspirante_en is not null then
      raise exception 'Ya has marcado esta autorización como vista.';
    end if;
    if to_jsonb(new) - 'visto_por_aspirante_en' is distinct from to_jsonb(old) - 'visto_por_aspirante_en' then
      raise exception 'No puedes modificar esta autorización, solo marcarla como vista.';
    end if;
    if new.visto_por_aspirante_en is null then
      raise exception 'Marcar como vista necesita una fecha.';
    end if;
    return new;
  end if;

  raise exception 'Una autorización de examen no se modifica.';
end
$$;

drop trigger if exists examen_autorizaciones_protecciones on public.examen_autorizaciones;
create trigger examen_autorizaciones_protecciones
before update on public.examen_autorizaciones
for each row
execute function public.examen_autorizaciones_protecciones();


-- ============================================================================
-- 4. RLS Y PERMISOS
-- ============================================================================
alter table public.examen_autorizaciones enable row level security;

-- Lectura, el comandante (para su propio historial) y el propio aspirante
-- (para ver que se le ha autorizado). Nadie más.
drop policy if exists "examen_autorizaciones_lectura" on public.examen_autorizaciones;
create policy "examen_autorizaciones_lectura"
on public.examen_autorizaciones
for select
to authenticated
using (
  public.mi_rango() = 'comandante'
  or aspirante_id = auth.uid()
);

-- Alta, solo el comandante. Redundante con el trigger de la sección 2 a
-- propósito, mismo patrón de defensa en profundidad que el resto del esquema.
drop policy if exists "examen_autorizaciones_alta" on public.examen_autorizaciones;
create policy "examen_autorizaciones_alta"
on public.examen_autorizaciones
for insert
to authenticated
with check (public.mi_rango() = 'comandante');

-- Edición, solo el propio aspirante, y solo para marcar visto (el trigger de
-- la sección 3 decide qué columna).
drop policy if exists "examen_autorizaciones_edicion_propio" on public.examen_autorizaciones;
create policy "examen_autorizaciones_edicion_propio"
on public.examen_autorizaciones
for update
to authenticated
using (aspirante_id = auth.uid())
with check (aspirante_id = auth.uid());

-- Sin política de DELETE. Es un registro de auditoría.

-- `revoke all` a los DOS roles antes de conceder, lección de
-- `08_endurecer_grants.sql`, Supabase concede por defecto todos los
-- privilegios de tabla a `anon` y a `authenticated` en cuanto se crea la
-- relación, y un `grant` no retira lo que ya hubiera.
revoke all on public.examen_autorizaciones from anon, authenticated;
grant select, insert, update on public.examen_autorizaciones to authenticated;


-- ============================================================================
-- 5. `examenes_antes_de_insertar()`, AMPLIADA CON LA AUTORIZACIÓN EXPRESA
-- ============================================================================
-- Se repite entera (verbatim salvo el bloque señalado) por el mismo criterio
-- que ya usan `02`, `04` y `10`, para que se lea de una vez.
create or replace function public.examenes_antes_de_insertar()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  rango_actual public.rango;
  ultimo record;
begin
  if new.id is null then
    new.id := gen_random_uuid();
  end if;
  if new.creado_en is null then
    new.creado_en := now();
  end if;

  -- Nadie manda el examen de otro. La política de alta (07, sección 7) ya lo
  -- exige; esto lo cubre también para la clave de servicio.
  if new.aspirante_id is distinct from auth.uid() then
    raise exception 'Solo puedes enviar tu propio examen.';
  end if;

  select p.rango into rango_actual from public.perfiles p where p.id = new.aspirante_id;
  if rango_actual is distinct from 'aspirante' then
    raise exception 'Solo un aspirante puede enviar un examen de ingreso.';
  end if;

  -- Un aspirante no puede tener dos exámenes pendientes a la vez, y no puede
  -- repetir salvo que el último haya quedado «no apto provisional» O que el
  -- comandante lo haya autorizado expresamente para ese examen concreto
  -- (`examen_autorizaciones`, 11_autorizar_nuevo_examen.sql). Esta
  -- comprobación da un mensaje claro; el índice único de `examenes` es la
  -- red de seguridad que no depende de leer antes de escribir.
  select e.id, e.estado, e.resultado_final into ultimo
    from public.examenes e
   where e.aspirante_id = new.aspirante_id
   order by e.creado_en desc
   limit 1;

  if ultimo.id is not null then
    if ultimo.estado = 'enviado' then
      raise exception 'Ya tienes un examen pendiente de corrección.';
    end if;
    if ultimo.resultado_final is distinct from 'no_apto_provisional'
       and not exists (
         select 1 from public.examen_autorizaciones a where a.examen_id = ultimo.id
       )
    then
      raise exception 'No puedes iniciar un nuevo examen hasta que se abra una nueva convocatoria.';
    end if;
  end if;

  -- El orden de preferencia tiene que ser una permutación completa de las
  -- seis unidades reales, ni una de más ni una de menos ni repetida. Comparar
  -- los dos arrays ordenados cubre las tres cosas a la vez. Sin cambios.
  if new.orden_preferencia is null
     or (select array_agg(u order by u) from unnest(new.orden_preferencia) as u)
        is distinct from
        (select array_agg(u order by u) from unnest(enum_range(null::public.unidad)) as u)
  then
    raise exception 'El orden de preferencia debe incluir las seis unidades, cada una una vez.';
  end if;

  -- La longitud sigue siendo exactamente 50. Un hueco ocupa su posición como
  -- NULL, nunca desaparece del array, así que la pregunta N sigue siempre en
  -- el índice N.
  if new.respuestas is null or array_length(new.respuestas, 1) is distinct from 50 then
    raise exception 'El examen necesita exactamente 50 posiciones, respondidas o no.';
  end if;
  -- Una posición puede quedar sin responder (NULL). Lo que no se admite es
  -- cualquier valor que no sea NULL ni esté entre 0 y 3.
  if exists (
    select 1 from unnest(new.respuestas) v where v is not null and v not between 0 and 3
  ) then
    raise exception 'Cada respuesta debe ser un número entre 0 y 3, o quedar sin responder.';
  end if;

  -- La única lectura de `examen_clave` en todo el sistema. Una posición NULL
  -- hace que la comparación valga NULL y el WHERE la descarte sola, así que
  -- una pregunta sin responder nunca suma un acierto.
  select count(*) into new.puntuacion_automatica
    from public.examen_clave c
   where new.respuestas[c.numero] = c.respuesta_correcta;

  new.resultado_automatico := case
    when new.puntuacion_automatica >= 30 then 'apto'::public.examen_resultado
    when new.puntuacion_automatica >= 25 then 'no_apto_provisional'::public.examen_resultado
    else 'no_apto_definitivo'::public.examen_resultado
  end;

  -- La unidad propuesta es la primera del orden de preferencia que esté
  -- dentro de lo que desbloquea la puntuación. Sin cambios.
  if new.resultado_automatico = 'apto' then
    select t.u into new.unidad_automatica
      from unnest(new.orden_preferencia) with ordinality as t(u, ord)
     where t.u = any(public.examen_unidades_desbloqueadas(new.puntuacion_automatica))
     order by t.ord
     limit 1;
  else
    new.unidad_automatica := null;
  end if;

  -- Un examen nace pendiente, sin corregir, lo pida quien lo pida.
  new.estado := 'enviado';
  new.resultado_final := null;
  new.unidad_final := null;
  new.ratificado_por := null;
  new.ratificado_en := null;
  new.corregido_manualmente := false;
  new.motivo_correccion := null;
  new.visto_por_aspirante_en := null;

  return new;
end
$$;

-- El trigger en sí no cambia, se recrea para que este archivo sea
-- autocontenido, mismo criterio que `10_examen_respuestas_parciales.sql`.
drop trigger if exists examenes_antes_de_insertar on public.examenes;
create trigger examenes_antes_de_insertar
before insert on public.examenes
for each row
execute function public.examenes_antes_de_insertar();


-- ============================================================================
-- 6. COMPROBACIONES
-- ============================================================================
-- Todas dentro de transacciones que acaban en ROLLBACK, no dejan nada
-- escrito. Necesitan un aspirante real con un último examen ya CORREGIDO
-- (no apto, de cualquiera de las dos bandas), y un comandante y un teniente
-- reales.
--
-- (a) Un teniente no puede autorizar, ni aunque lo intente
-- ---------------------------------------------------------------------------
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DEL-TENIENTE','role','authenticated')::text, true);
--       -- Debe FALLAR con «Solo el comandante puede autorizar un nuevo examen.»
--       insert into public.examen_autorizaciones (aspirante_id, motivo)
--       values ('UUID-DEL-ASPIRANTE', 'Prueba');
--     rollback;
--
-- (b) El comandante autoriza, y el examen_id se resuelve solo
-- ---------------------------------------------------------------------------
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DEL-COMANDANTE','role','authenticated')::text, true);
--
--       insert into public.examen_autorizaciones (aspirante_id, motivo)
--       values ('UUID-DEL-ASPIRANTE', 'Circunstancias justificadas, se autoriza repetir.')
--       returning examen_id, autorizado_por, motivo;
--       -- `examen_id` debe ser el id del último examen corregido de ese
--       -- aspirante, `autorizado_por` el UUID del comandante, nunca lo que
--       -- mandara el cliente si se hubiera intentado falsear.
--     rollback;
--
-- (c) Sin autorización, un no_apto_definitivo sigue sin poder repetir
-- ---------------------------------------------------------------------------
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DEL-ASPIRANTE','role','authenticated')::text, true);
--       -- Debe FALLAR con «No puedes iniciar un nuevo examen...»
--       insert into public.examenes (aspirante_id, orden_preferencia, respuestas)
--       values ('UUID-DEL-ASPIRANTE',
--         array['sanitario','buceadores','terrestres','forestal','drones','comunicaciones']::public.unidad[],
--         array_fill(0::smallint, array[50]));
--     rollback;
--
-- (d) Con la autorización de (b) ya aplicada de verdad (sin rollback), el
--     aspirante SÍ puede enviar un examen nuevo
-- ---------------------------------------------------------------------------
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DEL-ASPIRANTE','role','authenticated')::text, true);
--       insert into public.examenes (aspirante_id, orden_preferencia, respuestas)
--       values ('UUID-DEL-ASPIRANTE',
--         array['sanitario','buceadores','terrestres','forestal','drones','comunicaciones']::public.unidad[],
--         array_fill(0::smallint, array[50]))
--       returning id, estado;
--     rollback;
--
-- (e) Esa misma autorización no sirve para un TERCER examen
-- ---------------------------------------------------------------------------
-- Repitiendo el `insert` de (d) DOS VECES dentro del mismo bloque (sin
-- rollback intermedio): el primero pasa (consume la autorización de (b), que
-- queda ligada al examen viejo, no al nuevo), el segundo debe FALLAR con «Ya
-- tienes un examen pendiente de corrección.» si el primero se quedó
-- `enviado`, que es el caso normal.
--
-- (f) Como mucho una autorización por examen
-- ---------------------------------------------------------------------------
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DEL-COMANDANTE','role','authenticated')::text, true);
--       insert into public.examen_autorizaciones (aspirante_id, motivo) values ('UUID-DEL-ASPIRANTE','Primera');
--       -- Debe FALLAR con «Ya hay una autorización para el último examen de este aspirante.»
--       insert into public.examen_autorizaciones (aspirante_id, motivo) values ('UUID-DEL-ASPIRANTE','Segunda');
--     rollback;
--
-- (g) El aspirante ve su propia autorización y puede marcarla vista, una sola vez
-- ---------------------------------------------------------------------------
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DEL-ASPIRANTE','role','authenticated')::text, true);
--       select count(*) from public.examen_autorizaciones where aspirante_id = 'UUID-DEL-ASPIRANTE';
--       update public.examen_autorizaciones set visto_por_aspirante_en = now()
--        where aspirante_id = 'UUID-DEL-ASPIRANTE';
--       -- Debe FALLAR con «Ya has marcado esta autorización como vista.»
--       update public.examen_autorizaciones set visto_por_aspirante_en = now()
--        where aspirante_id = 'UUID-DEL-ASPIRANTE';
--     rollback;


-- ============================================================================
-- 7. ADVERTENCIAS
-- ============================================================================
-- 1. UNA AUTORIZACIÓN NO CADUCA POR SÍ SOLA. Mientras el aspirante no envíe
--    el examen nuevo, sigue vigente (no hay «se autorizó pero no se usó a
--    tiempo»). Si el comandante cambia de idea, la única vía es el SQL
--    Editor (`delete from examen_autorizaciones where id = ...`), no hay
--    botón para retirarla, no se ha pedido.
--
-- 2. ESTE ARCHIVO MANDA SOBRE EL `10` PARA `examenes_antes_de_insertar()`. Si
--    algún día se vuelve a ejecutar el `10`, ejecuta este a continuación, o
--    la autorización expresa deja de tenerse en cuenta.
