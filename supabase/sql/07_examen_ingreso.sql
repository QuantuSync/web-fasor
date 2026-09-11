-- ============================================================================
-- FASOR, zona interna (/enlace)
-- Examen de ingreso, esquema, corrección automática y ratificación.
--
-- Dónde se ejecuta: Supabase Dashboard, SQL Editor del proyecto.
-- Se ejecuta DESPUÉS de 01 a 06, y ANTES de 07b_examen_clave_secreta.sql, que
-- es el que siembra las 50 respuestas correctas. Es idempotente, y a
-- diferencia del 05 y del 06 no hace falta ejecutarlo en dos partes, aquí los
-- `create type` son tipos nuevos, no una ampliación de un enum ya en uso, así
-- que no hay restricción de transacción.
--
-- ESTE ARCHIVO SE COMMITEA. No contiene ninguna respuesta correcta, solo
-- esquema, lógica y permisos. La clave de respuestas va en el archivo
-- siguiente, que NO se commitea (ver su cabecera y el `.gitignore`).
--
-- ----------------------------------------------------------------------------
-- CÓMO SE GARANTIZA QUE LA RESPUESTA CORRECTA NO LLEGA AL NAVEGADOR
-- ----------------------------------------------------------------------------
-- `examen_clave` (sección 2) tiene RLS activo y SIN NINGUNA POLÍTICA, y se le
-- revoca todo permiso a `anon` y a `authenticated`. Nadie que entre por la API
-- de Supabase, que es como entra cualquier cliente, puede leerla ni con una
-- consulta directa ni pidiéndola por su nombre de columna. La única vía de
-- acceso es el trigger `examenes_antes_de_insertar` (sección 4), que es
-- `security definer` y por tanto corre con los permisos de su dueño, el mismo
-- mecanismo que ya usan `mi_rango()`, `puede_gestionar()` o
-- `mensajes_aviso_cadena()`. Ese trigger corrige el examen en el momento de
-- insertarlo y guarda solo el resultado (puntuación, banda, unidad
-- propuesta), nunca la clave. El bundle del sitio (`src/data/examen.ts`)
-- tampoco la lleva, no tiene ningún campo para ella.
--
-- ----------------------------------------------------------------------------
-- POR QUÉ UN RANGO SIN NIVEL NO ROMPE NADA DE ESTO
-- ----------------------------------------------------------------------------
-- `aspirante` no tiene nivel en el escalafón ni superior inmediato
-- (`nivel_rango()` y `superior_inmediato()` devuelven NULL para él sin tocar
-- esas funciones, ver 06_aspirante.sql). Aquí eso importa en dos sitios,
-- ninguno de los dos necesita protección adicional:
--
--   * Un aspirante nunca es remitente ni destinatario de un aviso de cadena
--     de mando, por el mismo mecanismo que ya protege a secretario y
--     tesorero, y además ya tiene bloqueado el buzón entero (06_aspirante.sql,
--     sección 3).
--   * La ratificación de un examen no pasa por `puede_gestionar()` ni por
--     ninguna comparación de niveles, usa `mi_rango() in (...)` con una lista
--     explícita de tres rangos (sección 6), así que no hay ninguna
--     comparación con NULL de la que preocuparse aquí.
-- ============================================================================


-- ============================================================================
-- 1. LOS DOS TIPOS NUEVOS
-- ============================================================================
-- `create type` no admite `if not exists`, así que se comprueba a mano, mismo
-- patrón que el resto de bloques idempotentes de este proyecto.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'examen_estado') then
    create type public.examen_estado as enum ('enviado', 'corregido');
  end if;
  if not exists (select 1 from pg_type where typname = 'examen_resultado') then
    create type public.examen_resultado as enum ('apto', 'no_apto_provisional', 'no_apto_definitivo');
  end if;
end
$$;


-- ============================================================================
-- 2. `examen_clave`, LA TABLA QUE NUNCA SE SIRVE POR LA VÍA NORMAL
-- ============================================================================
create table if not exists public.examen_clave (
  numero smallint primary key,
  respuesta_correcta smallint not null check (respuesta_correcta between 0 and 3)
);

alter table public.examen_clave enable row level security;

-- Sin ninguna política, a propósito. Y sin ningún grant a `anon` ni a
-- `authenticated`: aunque alguien colara una política algún día, sin permiso
-- de tabla no se llega ni a evaluarla. Solo un trigger `security definer`
-- (sección 4) la lee, porque corre como su dueño y no como quien llama.
revoke all on public.examen_clave from anon, authenticated;

-- Esta tabla nace vacía. Este archivo se ejecuta antes que
-- 07b_examen_clave_secreta.sql, así que lo normal es ver el aviso; si sigue
-- saliendo después de ejecutar el 07b, algo ha ido mal con el seed.
--
-- Es `raise warning` y no `raise exception` a propósito: un `raise exception`
-- aborta la transacción entera y este archivo no llegaría a crear ni la
-- tabla `examenes` ni ninguna política de más abajo, dejando la instalación
-- en un punto muerto. La comprobación que sí para en seco si algo falla va al
-- final del 07b (con las 50 filas ya insertadas, que es donde tiene que
-- estar).
do $$
declare
  filas integer;
begin
  select count(*) into filas from public.examen_clave;
  if filas <> 50 then
    raise warning 'FASOR: examen_clave tiene % filas, deberían ser 50. Ejecuta 07b_examen_clave_secreta.sql a continuación (o revisa por qué no dejó las 50 si ya lo has ejecutado).',
      filas;
  end if;
end
$$;


-- ============================================================================
-- 3. `examenes`
-- ============================================================================
create table if not exists public.examenes (
  id uuid primary key default gen_random_uuid(),
  aspirante_id uuid not null references public.perfiles(id) on delete cascade,
  -- Las seis unidades, en el orden de preferencia del aspirante (la primera
  -- es su favorita). Se valida que sea una permutación completa en el
  -- trigger de la sección 4, no aquí, porque un `check` no puede consultar
  -- `enum_range()` de forma sencilla contra un array de longitud variable.
  orden_preferencia public.unidad[] not null,
  -- Una por pregunta, en el mismo orden que `src/data/examen.ts` (índice 1 a
  -- 50), cada una entre 0 y 3. Se valida en el trigger, no con un `check`,
  -- por el mismo motivo que `orden_preferencia`.
  respuestas smallint[] not null,
  creado_en timestamptz not null default now(),
  estado public.examen_estado not null default 'enviado',
  -- Todo lo de aquí abajo lo calcula el trigger de la sección 4 al insertar,
  -- o el de la sección 6 al ratificar. Nunca lo que mande el cliente.
  puntuacion_automatica smallint,
  resultado_automatico public.examen_resultado,
  unidad_automatica public.unidad,
  resultado_final public.examen_resultado,
  unidad_final public.unidad,
  ratificado_por uuid references public.perfiles(id),
  ratificado_en timestamptz,
  corregido_manualmente boolean not null default false,
  motivo_correccion text,
  -- Para el banner de resultado que ve el aspirante (o el recién ascendido a
  -- Cadete) una sola vez. Lo pone él mismo, ver la política de la sección 7.
  visto_por_aspirante_en timestamptz
);

-- Un aspirante no puede tener dos exámenes pendientes a la vez. A nivel de
-- base de datos y a salvo de condiciones de carrera, no con una comprobación
-- de «select antes de insertar» que dos peticiones simultáneas podrían
-- saltarse las dos a la vez.
create unique index if not exists examenes_aspirante_pendiente_unico
  on public.examenes (aspirante_id)
  where estado = 'enviado';

create index if not exists examenes_aspirante_idx on public.examenes (aspirante_id, creado_en desc);
create index if not exists examenes_estado_idx on public.examenes (estado);


-- ============================================================================
-- 4. LA CORRECCIÓN AUTOMÁTICA, AL INSERTAR
-- ============================================================================

-- Qué unidades desbloquea cada banda de puntuación, de mayor a menor
-- exigencia. Una banda superior incluye siempre las de las bandas inferiores.
-- Los identificadores son los reales de `src/data/unidades.ts` (la unidad
-- aérea es `drones`, no se inventa ninguno nuevo).
create or replace function public.examen_unidades_desbloqueadas(p_puntuacion smallint)
returns public.unidad[]
language sql
immutable
as $$
  select case
    when p_puntuacion >= 46 then
      array['buceadores', 'sanitario', 'terrestres', 'forestal', 'drones', 'comunicaciones']::public.unidad[]
    when p_puntuacion >= 41 then
      array['sanitario', 'terrestres', 'forestal', 'drones', 'comunicaciones']::public.unidad[]
    when p_puntuacion >= 36 then
      array['terrestres', 'forestal', 'drones', 'comunicaciones']::public.unidad[]
    when p_puntuacion >= 30 then
      array['drones', 'comunicaciones']::public.unidad[]
    else
      array[]::public.unidad[]
  end
$$;

-- Antes de insertar, valida todo lo que hay que validar y calcula el
-- resultado automático. Es la única función de todo el esquema que lee
-- `examen_clave`, y puede hacerlo porque es `security definer`.
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

  -- Nadie manda el examen de otro. La política de alta (sección 7) ya lo
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
  -- comprobación da un mensaje claro; el índice único de la sección 3 es la
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
  -- los dos arrays ordenados cubre las tres cosas a la vez.
  if new.orden_preferencia is null
     or (select array_agg(u order by u) from unnest(new.orden_preferencia) as u)
        is distinct from
        (select array_agg(u order by u) from unnest(enum_range(null::public.unidad)) as u)
  then
    raise exception 'El orden de preferencia debe incluir las seis unidades, cada una una vez.';
  end if;

  if new.respuestas is null or array_length(new.respuestas, 1) is distinct from 50 then
    raise exception 'El examen necesita exactamente 50 respuestas.';
  end if;
  if exists (
    select 1 from unnest(new.respuestas) v where v is null or v not between 0 and 3
  ) then
    raise exception 'Cada respuesta debe ser un número entre 0 y 3.';
  end if;

  -- La única lectura de `examen_clave` en todo el sistema.
  select count(*) into new.puntuacion_automatica
    from public.examen_clave c
   where new.respuestas[c.numero] = c.respuesta_correcta;

  new.resultado_automatico := case
    when new.puntuacion_automatica >= 30 then 'apto'::public.examen_resultado
    when new.puntuacion_automatica >= 25 then 'no_apto_provisional'::public.examen_resultado
    else 'no_apto_definitivo'::public.examen_resultado
  end;

  -- La unidad propuesta es la primera del orden de preferencia que esté
  -- dentro de lo que desbloquea la puntuación. `with ordinality` conserva el
  -- orden del array, no es un detalle menor, es justo lo que decide cuál se
  -- asigna cuando hay varias desbloqueadas.
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

drop trigger if exists examenes_antes_de_insertar on public.examenes;
create trigger examenes_antes_de_insertar
before insert on public.examenes
for each row
execute function public.examenes_antes_de_insertar();


-- ============================================================================
-- 5. LO QUE RLS NO PUEDE VER, LA RATIFICACIÓN
-- ============================================================================
-- Dos caminos, mismo patrón que `perfiles_protecciones`. El del propio
-- aspirante solo deja tocar `visto_por_aspirante_en`, de null a un valor,
-- nunca al revés. El del mando exige que nada de lo enviado cambie, obliga a
-- explicar el motivo cuando se corrige a mano, y blinda la unidad, con las
-- reglas explicadas más abajo. Todas las condiciones son siempre verdaderas o
-- falsas, nunca NULL, misma disciplina que el resto del esquema.
create or replace function public.examenes_protecciones()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
begin
  -- ---- Camino del propio aspirante ---------------------------------------
  if actor is not null and actor = old.aspirante_id then
    if old.visto_por_aspirante_en is not null then
      raise exception 'Ya has marcado este examen como visto.';
    end if;
    if to_jsonb(new) - 'visto_por_aspirante_en' is distinct from to_jsonb(old) - 'visto_por_aspirante_en' then
      raise exception 'No puedes modificar tu examen, solo marcarlo como visto.';
    end if;
    if new.visto_por_aspirante_en is null then
      raise exception 'Marcar como visto necesita una fecha.';
    end if;
    return new;
  end if;

  -- ---- Camino del mando ---------------------------------------------------
  -- Nada de lo que envió el aspirante cambia nunca, sea quien sea quien
  -- escriba.
  if new.aspirante_id is distinct from old.aspirante_id
     or new.orden_preferencia is distinct from old.orden_preferencia
     or new.respuestas is distinct from old.respuestas
     or new.creado_en is distinct from old.creado_en
     or new.puntuacion_automatica is distinct from old.puntuacion_automatica
     or new.resultado_automatico is distinct from old.resultado_automatico
     or new.unidad_automatica is distinct from old.unidad_automatica then
    raise exception 'Los datos del examen enviado no se pueden modificar.';
  end if;

  -- Un examen ya corregido no se vuelve a tocar. La política de la sección 7
  -- ya filtra esto para quien entra por la web (`using (... estado =
  -- 'enviado')`, que es lo que resuelve la concurrencia entre dos mandos);
  -- esto lo cubre también para la clave de servicio.
  if old.estado = 'corregido' then
    raise exception 'Este examen ya ha sido corregido.';
  end if;
  if new.estado is distinct from 'corregido' then
    raise exception 'La corrección deja el examen en estado corregido.';
  end if;
  if new.resultado_final is null then
    raise exception 'Hace falta un resultado final.';
  end if;

  -- Sin corregir manualmente, el resultado y la unidad tienen que ser
  -- exactamente los automáticos: un clic en APTO o NO APTO no puede colarse
  -- como una corrección silenciosa.
  if new.corregido_manualmente then
    if new.motivo_correccion is null or length(btrim(new.motivo_correccion)) = 0 then
      raise exception 'Corregir un examen exige explicar el motivo.';
    end if;
  else
    if new.resultado_final is distinct from old.resultado_automatico
       or new.unidad_final is distinct from old.unidad_automatica then
      raise exception 'Sin corregir manualmente, el resultado y la unidad tienen que ser los automáticos.';
    end if;
  end if;

  -- Unidad obligatoria si el resultado final es apto, prohibida si no. Sin
  -- esto, convertir un «no apto» en «apto» podía dejar la unidad en null, y
  -- eso promocionaría a un Cadete sin unidad, un estado que no debe existir.
  if new.resultado_final = 'apto' and new.unidad_final is null then
    raise exception 'Un examen apto necesita una unidad asignada.';
  end if;
  if new.resultado_final is distinct from 'apto' and new.unidad_final is not null then
    raise exception 'Un examen no apto no lleva unidad asignada.';
  end if;

  -- Convertir un «no apto» en «apto» exige asignar una unidad real donde
  -- antes no había ninguna (`unidad_automatica` era null), y esa asignación
  -- es la que se reserva al comandante.
  if old.resultado_automatico is distinct from 'apto'
     and new.resultado_final = 'apto'
     and public.mi_rango() is distinct from 'comandante'::public.rango then
    raise exception 'Convertir un no apto en apto exige asignar unidad, y eso corresponde al comandante.';
  end if;

  -- Y aunque ya fuera apto, cambiar la unidad propuesta por otra distinta
  -- también se reserva al comandante. Pasar de apto a no apto no entra aquí,
  -- porque entonces `unidad_final` queda en null por la comprobación de
  -- arriba, no «distinta de la propuesta».
  if new.resultado_final = 'apto'
     and new.unidad_final is distinct from old.unidad_automatica
     and public.mi_rango() is distinct from 'comandante'::public.rango then
    raise exception 'Solo el comandante puede asignar una unidad distinta de la propuesta.';
  end if;

  -- Quién ratifica y cuándo lo decide el servidor, no lo que mande el
  -- cliente.
  new.ratificado_por := actor;
  new.ratificado_en := now();

  return new;
end
$$;

drop trigger if exists examenes_protecciones on public.examenes;
create trigger examenes_protecciones
before update on public.examenes
for each row
execute function public.examenes_protecciones();


-- ============================================================================
-- 6. EL PASO A CADETE, AL RATIFICAR APTO
-- ============================================================================
-- Se dispara solo cuando la ratificación deja el examen en «corregido» con
-- resultado «apto» (el `when` del trigger lo filtra, así que no se ejecuta en
-- cualquier otro update). Es `security definer`, así que esta escritura sobre
-- `perfiles` corre con los permisos de su dueño y no pasa por la política
-- `perfiles_edicion`, exactamente igual que `mensajes_aviso_cadena` ya
-- escribe hoy en `avisos_cadena` sin ser el propio interesado. Hace falta,
-- porque quien ratifica puede ser un simple teniente, que hoy no gestiona a
-- nadie en absoluto por la vía normal.
--
-- Por qué esto NO debilita `perfiles_protecciones` (05_cargos_junta.sql).
-- Ese trigger sigue disparándose igual, es un trigger normal y no una
-- política. `actor` ahí es quien ratifica (el mando), nunca coincide con
-- `new.id` (el aspirante que asciende), así que la rama de «reglas sobre uno
-- mismo» no entra, ni la del rango propio ni la del nombre. Y
-- `pierde_el_mando` da `false` porque `old.rango` es `aspirante`, nunca
-- `comandante`. La promoción pasa limpia sin tocar ni debilitar esa función.
--
-- No se envuelve en `exception when others` como sí hace el trigger de
-- avisos de cadena: si esto fallara, la ratificación entera tiene que
-- deshacerse, no es un efecto secundario tolerable dejar un examen «apto»
-- sin que la persona haya ascendido de verdad.
create or replace function public.examenes_promocion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.perfiles
     set rango = 'cadete', unidad = new.unidad_final
   where id = new.aspirante_id
     and rango = 'aspirante';

  return null;
end
$$;

drop trigger if exists examenes_promocion on public.examenes;
create trigger examenes_promocion
after update on public.examenes
for each row
when (
  new.estado = 'corregido'
  and old.estado is distinct from new.estado
  and new.resultado_final = 'apto'
)
execute function public.examenes_promocion();


-- ============================================================================
-- 7. RLS Y POLÍTICAS DE `examenes`
-- ============================================================================
alter table public.examenes enable row level security;

-- Lectura: el propio aspirante sobre su fila, y teniente, capitán y
-- comandante sobre todas (no acotado a unidad, porque un aspirante no tiene).
-- Secretario y tesorero NO están aquí, no revisan exámenes, solo gestionan
-- las cuentas (ver 06_aspirante.sql).
drop policy if exists "examenes_lectura" on public.examenes;
create policy "examenes_lectura"
on public.examenes
for select
to authenticated
using (
  aspirante_id = auth.uid()
  or public.mi_rango() in ('teniente', 'capitan', 'comandante')
);

-- Alta: solo el propio aspirante, sobre su propia fila. El resto de reglas
-- (una sola pendiente a la vez, elegibilidad para repetir, forma de los
-- datos) las aplica el trigger de la sección 4.
drop policy if exists "examenes_alta" on public.examenes;
create policy "examenes_alta"
on public.examenes
for insert
to authenticated
with check (
  aspirante_id = auth.uid()
  and public.mi_rango() = 'aspirante'
);

-- Edición, camino del mando. `estado = 'enviado'` en el `using` es lo que
-- resuelve la concurrencia entre dos revisores, si dos entran a la vez, el
-- primero que confirme deja el examen en `corregido` y el `update` del
-- segundo no encuentra ninguna fila que cumpla esta condición, afecta a 0
-- filas, y el cliente lo interpreta como «ya lo ha corregido otro mando».
drop policy if exists "examenes_edicion_mando" on public.examenes;
create policy "examenes_edicion_mando"
on public.examenes
for update
to authenticated
using (
  public.mi_rango() in ('teniente', 'capitan', 'comandante')
  and estado = 'enviado'
)
with check (
  public.mi_rango() in ('teniente', 'capitan', 'comandante')
);

-- Edición, camino del propio aspirante. Solo para marcar el resultado como
-- visto; qué columna se puede tocar lo decide el trigger de la sección 5.
drop policy if exists "examenes_edicion_propio" on public.examenes;
create policy "examenes_edicion_propio"
on public.examenes
for update
to authenticated
using (aspirante_id = auth.uid())
with check (aspirante_id = auth.uid());

-- Sin política de DELETE. Un examen no se borra.

revoke all on public.examenes from anon;
grant select, insert, update on public.examenes to authenticated;
revoke delete on public.examenes from authenticated;


-- ============================================================================
-- 8. LA VISTA DE CORRECCIÓN, PARA QUE UN MANDO VEA ACIERTO Y FALLO AL REVISAR
-- ============================================================================
-- «Ven las respuestas» en la revisión significa algo más que ver qué opción
-- marcó el aspirante, un mando necesita saber si acertó o falló para poder
-- detectar una anomalía. Eso exige comparar contra `examen_clave`, que no
-- tiene ningún permiso para `authenticated` (sección 2). La solución es la
-- misma que ya usa la vista `directorio` de `03_buzon_mensajes.sql` para un
-- problema parecido con `perfiles`, una vista propiedad de su dueño (no de
-- quien la consulta), que por eso puede leer una tabla sin permisos para el
-- rol autenticado, con un `where` que sí mira a quien pregunta de verdad.
--
-- La diferencia con el caso del bundle es importante y no es un hueco, esto
-- NO expone la clave a cualquiera. Sale una fila por pregunta y por examen,
-- solo para quien tiene sesión de teniente, capitán o comandante en ese
-- momento (`mi_rango()` lee `auth.uid()`, así que sigue siendo la identidad
-- real de quien pregunta, no la del dueño de la vista), y solo para exámenes
-- que esa política ya dejaría ver. Un aspirante nunca ve esta vista, y nadie
-- la ve para un examen ajeno a lo que `examenes_lectura` ya permite.
drop view if exists public.examen_correccion;
create view public.examen_correccion as
  select
    e.id as examen_id,
    gs.numero::smallint as numero,
    gs.respuesta::smallint as respuesta,
    c.respuesta_correcta,
    (gs.respuesta = c.respuesta_correcta) as acierto
  from public.examenes e
  cross join lateral unnest(e.respuestas) with ordinality as gs(respuesta, numero)
  join public.examen_clave c on c.numero = gs.numero::smallint
  where public.mi_rango() in ('teniente', 'capitan', 'comandante');

do $$
begin
  begin
    execute 'alter view public.examen_correccion set (security_invoker = false)';
  exception when others then
    raise notice 'FASOR: esta versión de PostgreSQL no admite security_invoker. La vista ya se evalúa con los permisos de su dueño, que es el comportamiento buscado.';
  end;
end
$$;

revoke all on public.examen_correccion from anon;
grant select on public.examen_correccion to authenticated;


-- ============================================================================
-- 9. COMPROBACIONES
-- ============================================================================
-- Ejecútalas después del 07b (con la clave ya sembrada). El SQL Editor corre
-- sin sesión, así que se simulan las claims del JWT igual que en los archivos
-- anteriores. TODO BLOQUE ACABA EN ROLLBACK.
--
-- Necesitas, ya dados de alta, un aspirante, un teniente, un capitán, un
-- comandante y un secretario (para comprobar que este último no puede
-- ratificar). Esta consulta te da los identificadores:
--
--     select id, nombre, rango from public.perfiles
--      where rango in ('aspirante','teniente','capitan','comandante','secretario')
--      order by rango;
--
-- ---------------------------------------------------------------------------
-- (a) Un aspirante manda su examen y la puntuación sale bien
-- ---------------------------------------------------------------------------
-- Sustituye `array[...]` por 50 valores reales (0 a 3) y comprueba a mano
-- cuántos coinciden con `examen_clave` para verificar `puntuacion_automatica`.
--
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DEL-ASPIRANTE','role','authenticated')::text, true);
--
--       insert into public.examenes (aspirante_id, orden_preferencia, respuestas)
--       values (
--         'UUID-DEL-ASPIRANTE',
--         array['sanitario','buceadores','terrestres','forestal','drones','comunicaciones']::public.unidad[],
--         array[0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1]::smallint[]
--       );
--
--       select puntuacion_automatica, resultado_automatico, unidad_automatica, estado
--         from public.examenes where aspirante_id = 'UUID-DEL-ASPIRANTE';
--     rollback;
--
-- ---------------------------------------------------------------------------
-- (b) No puede mandar un segundo mientras el primero está pendiente
-- ---------------------------------------------------------------------------
-- Repite el `insert` de (a) DOS VECES dentro de la misma transacción (sin el
-- rollback intermedio). Debe FALLAR la segunda vez con «Ya tienes un examen
-- pendiente de corrección.».
--
-- ---------------------------------------------------------------------------
-- (c) Nadie puede leer `examen_clave` directamente
-- ---------------------------------------------------------------------------
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DE-UN-TENIENTE','role','authenticated')::text, true);
--       -- Debe fallar con «permission denied for table examen_clave»
--       select * from public.examen_clave;
--     rollback;
--
-- ---------------------------------------------------------------------------
-- (c-bis) Pero un teniente sí ve el acierto o fallo a través de la vista
-- ---------------------------------------------------------------------------
-- Necesita un examen ya enviado (el de (a), sin rollback, o uno real).
--
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DE-UN-TENIENTE','role','authenticated')::text, true);
--       -- Debe devolver 50 filas, con `acierto` en true o false
--       select numero, respuesta, respuesta_correcta, acierto
--         from public.examen_correccion
--        where examen_id = 'UUID-DEL-EXAMEN'
--        order by numero;
--     rollback;
--
-- Y un aspirante, aunque sea el suyo, debe ver CERO filas:
--
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DEL-ASPIRANTE','role','authenticated')::text, true);
--       select count(*) from public.examen_correccion where examen_id = 'UUID-DEL-EXAMEN';
--     rollback;
--
-- ---------------------------------------------------------------------------
-- (d) Un secretario no puede ratificar
-- ---------------------------------------------------------------------------
-- Necesita un examen ya enviado (usa el `insert` de (a) primero, sin
-- rollback, dentro del mismo bloque, o uno real).
--
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DEL-SECRETARIO','role','authenticated')::text, true);
--       -- Debe afectar a CERO filas
--       update public.examenes set estado = 'corregido', resultado_final = 'no_apto_definitivo'
--        where aspirante_id = 'UUID-DEL-ASPIRANTE' and estado = 'enviado';
--     rollback;
--
-- ---------------------------------------------------------------------------
-- (e) Un teniente ratifica APTO y el aspirante pasa a Cadete
-- ---------------------------------------------------------------------------
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DEL-TENIENTE','role','authenticated')::text, true);
--
--       update public.examenes
--          set estado = 'corregido',
--              resultado_final = resultado_automatico,
--              unidad_final = unidad_automatica,
--              corregido_manualmente = false
--        where aspirante_id = 'UUID-DEL-ASPIRANTE' and estado = 'enviado'
--       returning *;
--
--       -- Solo si el examen de (a) dio «apto»; si no, prueba con datos que sí den apto.
--       reset role;
--       select rango, unidad from public.perfiles where id = 'UUID-DEL-ASPIRANTE';
--     rollback;
--
-- ---------------------------------------------------------------------------
-- (f) Dos mandos «a la vez», el segundo ve que ya está corregido
-- ---------------------------------------------------------------------------
-- Dentro del mismo bloque de (e), justo después del primer `update`, repite
-- el mismo `update` con la identidad de OTRO mando. Debe afectar a CERO
-- filas (el `estado = 'enviado'` del `using` ya no encuentra la fila).
--
-- ---------------------------------------------------------------------------
-- (g) Un teniente o un capitán no puede convertir un no apto en apto
-- ---------------------------------------------------------------------------
-- Necesita un examen cuyo `resultado_automatico` sea `no_apto_provisional` o
-- `no_apto_definitivo`.
--
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DEL-TENIENTE','role','authenticated')::text, true);
--
--       -- Debe FALLAR con «Convertir un no apto en apto exige asignar unidad...»
--       update public.examenes
--          set estado = 'corregido', resultado_final = 'apto', unidad_final = 'sanitario',
--              corregido_manualmente = true, motivo_correccion = 'Prueba'
--        where aspirante_id = 'UUID-DEL-ASPIRANTE' and estado = 'enviado';
--     rollback;
--
-- El comandante haciendo lo mismo debe pasar y promocionar.
--
-- ---------------------------------------------------------------------------
-- (h) Un teniente o un capitán no puede cambiar la unidad de un examen apto
-- ---------------------------------------------------------------------------
-- Necesita un examen cuyo `resultado_automatico` sea `apto`.
--
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DEL-CAPITAN','role','authenticated')::text, true);
--
--       -- Debe FALLAR con «Solo el comandante puede asignar una unidad distinta...»
--       update public.examenes
--          set estado = 'corregido', resultado_final = 'apto', unidad_final = 'comunicaciones',
--              corregido_manualmente = true, motivo_correccion = 'Prueba'
--        where aspirante_id = 'UUID-DEL-ASPIRANTE' and estado = 'enviado'
--          and unidad_automatica is distinct from 'comunicaciones';
--     rollback;
--
-- Pasar de apto a no apto SÍ debe funcionar para un teniente o un capitán
-- (no asigna ninguna unidad):
--
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DEL-TENIENTE','role','authenticated')::text, true);
--       update public.examenes
--          set estado = 'corregido', resultado_final = 'no_apto_provisional', unidad_final = null,
--              corregido_manualmente = true, motivo_correccion = 'Prueba'
--        where aspirante_id = 'UUID-DEL-ASPIRANTE' and estado = 'enviado';
--     rollback;
--
-- ---------------------------------------------------------------------------
-- (i) Unidad obligatoria si apto, prohibida si no, sin importar quién
-- ---------------------------------------------------------------------------
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DEL-COMANDANTE','role','authenticated')::text, true);
--
--       -- Debe FALLAR con «Un examen apto necesita una unidad asignada.»
--       update public.examenes
--          set estado = 'corregido', resultado_final = 'apto', unidad_final = null,
--              corregido_manualmente = true, motivo_correccion = 'Prueba'
--        where aspirante_id = 'UUID-DEL-ASPIRANTE' and estado = 'enviado';
--
--       -- Debe FALLAR con «Un examen no apto no lleva unidad asignada.»
--       update public.examenes
--          set estado = 'corregido', resultado_final = 'no_apto_definitivo', unidad_final = 'sanitario',
--              corregido_manualmente = true, motivo_correccion = 'Prueba'
--        where aspirante_id = 'UUID-DEL-ASPIRANTE' and estado = 'enviado';
--     rollback;


-- ============================================================================
-- 10. ADVERTENCIAS
-- ============================================================================
-- 1. LA CLAVE DE RESPUESTAS VIVE EN 07b_examen_clave_secreta.sql, QUE NO SE
--    COMMITEA. Sin ejecutarlo, `examen_clave` está vacía y cualquier examen
--    que se envíe sale con `puntuacion_automatica = 0`. El aviso de la
--    sección 2 te lo recuerda cada vez que se ejecute este archivo.
--
-- 2. UN VALOR DE ENUM NO SE PUEDE QUITAR (no aplica aquí, `examen_estado` y
--    `examen_resultado` son tipos nuevos, no una ampliación de `rango`), pero
--    sí conviene saber que si algún día hace falta un valor más en cualquiera
--    de los dos, será para siempre.
--
-- 3. NO EXISTE UN MECANISMO DE AUTOSERVICIO PARA QUE UN «NO APTO DEFINITIVO»
--    REPITA. El trigger de la sección 4 lo bloquea a propósito. Si hay que
--    reabrirlo a alguien concreto, la vía es el SQL Editor (por ejemplo,
--    borrando o corrigiendo a mano su último examen), mismo principio que ya
--    usa el proyecto para el último comandante en 02_blindaje_rango_propio.sql.
