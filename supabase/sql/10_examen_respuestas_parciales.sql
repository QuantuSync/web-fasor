-- ============================================================================
-- FASOR, zona interna (/enlace)
-- Permite enviar el examen de ingreso con preguntas sin responder.
--
-- Dónde se ejecuta: Supabase Dashboard, SQL Editor del proyecto (o la CLI de
-- Supabase, `supabase db query --linked --file supabase/sql/10_examen_respuestas_parciales.sql`).
-- Se ejecuta DESPUÉS de `07_examen_ingreso.sql`. Es idempotente,
-- `create or replace function` dos veces deja el mismo resultado.
--
-- ----------------------------------------------------------------------------
-- QUÉ CAMBIA
-- ----------------------------------------------------------------------------
-- Hasta ahora `examenes_antes_de_insertar()` exigía las 50 respuestas, cada
-- una un número entre 0 y 3, o el examen se rechazaba entero. El aspirante ya
-- no está obligado a responder todas para poder enviar; si envía con huecos,
-- se le pide confirmación en el cliente (con el número de preguntas sin
-- responder y el aviso de que no podrá modificarlo después), pero el servidor
-- tiene que aceptarlo igual.
--
-- Se reemplaza `examenes_antes_de_insertar()` entera (repetida aquí verbatim
-- salvo las dos líneas que cambian, para que la función se lea de una vez y
-- no haya que reconstruirla mentalmente entre dos archivos, mismo criterio
-- que ya usan `02_blindaje_rango_propio.sql` y `04_eliminacion_buzon.sql`).
--
-- Dos condiciones, las dos exigidas explícitamente y las dos comprobadas más
-- abajo:
--
--   1. La longitud del array sigue siendo EXACTAMENTE 50. Un hueco se
--      representa como `NULL` en su posición, nunca quitando la posición,
--      así que la pregunta 37 sigue estando siempre en el índice 37 y no se
--      desplaza nada. El `array_length(...) is distinct from 50` no cambia.
--   2. Una respuesta puede ser NULL (sin responder) o un número entre 0 y 3;
--      cualquier otra cosa se sigue rechazando. Ese es el único cambio en la
--      validación, `v is null or v not between 0 and 3` (que rechazaba el
--      NULL) pasa a `v is not null and v not between 0 and 3` (que lo deja
--      pasar y sigue rechazando lo demás).
--
-- ----------------------------------------------------------------------------
-- POR QUÉ UN HUECO NUNCA CUENTA COMO ACIERTO
-- ----------------------------------------------------------------------------
-- La línea que puntúa no cambia ni una letra:
--
--     select count(*) into new.puntuacion_automatica
--       from public.examen_clave c
--      where new.respuestas[c.numero] = c.respuesta_correcta;
--
-- En SQL, comparar NULL con cualquier cosa (`NULL = 2`) no vale falso, vale
-- NULL, y un `WHERE` descarta las filas cuya condición vale NULL exactamente
-- igual que las que valen falso. Una pregunta sin responder produce
-- `new.respuestas[c.numero] = c.respuesta_correcta` → NULL → la fila no
-- entra en el recuento. No hace falta un `and ... is not null` aparte, el
-- propio operador de igualdad ya lo hace, pero como esto es exactamente el
-- tipo de comportamiento con NULL que en otras partes de este esquema hay
-- que blindar a mano (`is distinct from`, `coalesce(..., true)`), aquí se dice
-- explícitamente y se comprueba en vivo en la sección de comprobaciones, no
-- se da por supuesto.
-- ============================================================================

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
  -- repetir salvo que el último haya quedado «no apto provisional». Esta
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
    if ultimo.resultado_final is distinct from 'no_apto_provisional' then
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
  -- Cambio de este archivo: una posición puede quedar sin responder (NULL).
  -- Lo que no se admite es cualquier valor que no sea NULL ni esté entre 0 y 3.
  if exists (
    select 1 from unnest(new.respuestas) v where v is not null and v not between 0 and 3
  ) then
    raise exception 'Cada respuesta debe ser un número entre 0 y 3, o quedar sin responder.';
  end if;

  -- La única lectura de `examen_clave` en todo el sistema. Una posición NULL
  -- hace que la comparación valga NULL y el WHERE la descarte sola, así que
  -- una pregunta sin responder nunca suma un acierto (ver cabecera de este
  -- archivo, comprobado explícitamente más abajo).
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

-- El trigger en sí no cambia (mismo nombre, mismo evento), pero se recrea
-- para que este archivo sea autocontenido y no dependa de que el `07` ya lo
-- haya dejado puesto con el nombre correcto.
drop trigger if exists examenes_antes_de_insertar on public.examenes;
create trigger examenes_antes_de_insertar
before insert on public.examenes
for each row
execute function public.examenes_antes_de_insertar();


-- ============================================================================
-- COMPROBACIONES
-- ============================================================================
-- Todas dentro de transacciones que acaban en ROLLBACK, no dejan nada escrito.
-- Necesitan un aspirante real y que `examen_clave` ya esté sembrada (07b).
--
-- (a) 50 respuestas, con huecos, se acepta y la longitud se conserva
-- ---------------------------------------------------------------------------
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DEL-ASPIRANTE','role','authenticated')::text, true);
--
--       insert into public.examenes (aspirante_id, orden_preferencia, respuestas)
--       values (
--         'UUID-DEL-ASPIRANTE',
--         array['sanitario','buceadores','terrestres','forestal','drones','comunicaciones']::public.unidad[],
--         array[0,1,null,3,0,null,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,
--               2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1]::smallint[]
--       );
--
--       select array_length(respuestas, 1) as longitud, puntuacion_automatica
--         from public.examenes where aspirante_id = 'UUID-DEL-ASPIRANTE';
--     rollback;
--
--   `longitud` debe salir 50 igual que antes.
--
-- (b) Un hueco puesto exactamente donde la clave acierta NO suma punto
-- ---------------------------------------------------------------------------
-- La prueba de verdad, no basta con «se acepta», hay que ver el número.
-- Sustituye `X` por la respuesta correcta real de la pregunta 1 en
-- `examen_clave` (`select respuesta_correcta from examen_clave where numero=1`)
-- y compara la puntuación de dos envíos idénticos salvo esa posición.
--
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DEL-ASPIRANTE','role','authenticated')::text, true);
--
--       -- Con la pregunta 1 acertada (usa el valor real de X)
--       insert into public.examenes (aspirante_id, orden_preferencia, respuestas)
--       values ('UUID-DEL-ASPIRANTE',
--         array['sanitario','buceadores','terrestres','forestal','drones','comunicaciones']::public.unidad[],
--         (array[X] || array_fill(0::smallint, array[49]))::smallint[]);
--       select puntuacion_automatica as con_respuesta from public.examenes
--        where aspirante_id = 'UUID-DEL-ASPIRANTE' order by creado_en desc limit 1;
--     rollback;
--
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DEL-ASPIRANTE','role','authenticated')::text, true);
--
--       -- La misma pregunta 1, ahora sin responder (NULL)
--       insert into public.examenes (aspirante_id, orden_preferencia, respuestas)
--       values ('UUID-DEL-ASPIRANTE',
--         array['sanitario','buceadores','terrestres','forestal','drones','comunicaciones']::public.unidad[],
--         (array[null::smallint] || array_fill(0::smallint, array[49]))::smallint[]);
--       select puntuacion_automatica as con_hueco from public.examenes
--        where aspirante_id = 'UUID-DEL-ASPIRANTE' order by creado_en desc limit 1;
--     rollback;
--
--   `con_hueco` tiene que ser exactamente `con_respuesta - 1` (el hueco no
--   suma el acierto que sí sumaba la respuesta correcta, y el resto del
--   array, todo ceros, puntúa igual en los dos envíos).
--
-- (c) Un valor fuera de 0 a 3 (que no sea NULL) se sigue rechazando
-- ---------------------------------------------------------------------------
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DEL-ASPIRANTE','role','authenticated')::text, true);
--       -- Debe FALLAR con «Cada respuesta debe ser un número entre 0 y 3, o quedar sin responder.»
--       insert into public.examenes (aspirante_id, orden_preferencia, respuestas)
--       values ('UUID-DEL-ASPIRANTE',
--         array['sanitario','buceadores','terrestres','forestal','drones','comunicaciones']::public.unidad[],
--         (array[9::smallint] || array_fill(0::smallint, array[49]))::smallint[]);
--     rollback;
--
-- (d) Menos de 50 posiciones se sigue rechazando (los huecos son NULL, no
--     posiciones que faltan)
-- ---------------------------------------------------------------------------
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DEL-ASPIRANTE','role','authenticated')::text, true);
--       -- Debe FALLAR con «El examen necesita exactamente 50 posiciones...»
--       insert into public.examenes (aspirante_id, orden_preferencia, respuestas)
--       values ('UUID-DEL-ASPIRANTE',
--         array['sanitario','buceadores','terrestres','forestal','drones','comunicaciones']::public.unidad[],
--         array_fill(0::smallint, array[49]));
--     rollback;
