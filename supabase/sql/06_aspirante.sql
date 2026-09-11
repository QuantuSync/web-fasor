-- ============================================================================
-- FASOR, zona interna (/enlace)
-- El rango `aspirante`, para el examen de ingreso.
--
-- Dónde se ejecuta: Supabase Dashboard, SQL Editor del proyecto.
-- Se ejecuta DESPUÉS de 01, 02, 03, 04 y 05. Es idempotente.
--
-- ****************************************************************************
-- ESTE ARCHIVO SE EJECUTA EN DOS VECES. NO LO LANCES ENTERO DE UNA SOLA VEZ.
-- El motivo está explicado en el banner de la PARTE A (el mismo del 05).
-- ****************************************************************************
--
-- ----------------------------------------------------------------------------
-- QUÉ AÑADE
-- ----------------------------------------------------------------------------
-- Un aspirante es quien está haciendo el proceso de ingreso (examen incluido,
-- ver 07_examen_ingreso.sql) y todavía no es miembro. Está FUERA de todo lo
-- operativo:
--
--   * NO tiene nivel en el escalafón, ni superior inmediato. Igual que
--     secretario y tesorero, `nivel_rango()` y `superior_inmediato()` ya
--     devuelven NULL para él sin tocar esas funciones (su `CASE` ya termina en
--     `else null`, y un valor del enum que no se añade a los `WHEN` cae ahí
--     directo). No genera ni recibe avisos de cadena de mando, por el mismo
--     mecanismo que ya protege a secretario y tesorero (02 y 05).
--   * NO tiene unidad nunca, y eso lo garantiza una restricción nueva de la
--     sección 1, no solo la pantalla.
--   * NO puede enviar ni recibir mensajes del buzón, ni aparecer en el
--     directorio (secciones 3 y 4). Esto sí hay que bloquearlo a mano, porque
--     hoy cualquier cuenta activa puede escribir a cualquier otra.
--   * NO ve la gestión de miembros ni el buzón de nadie (eso ya lo dejan fuera
--     `puede_gestionar()` y la propia pantalla, sin tocar nada, ver más abajo).
--
-- Lo dan de alta comandante, secretario y tesorero. Capitán y teniente no.
-- Esto sale solo, sin tocar `puede_gestionar()`: comandante gestiona a
-- cualquiera, secretario y tesorero gestionan a cualquiera que no sea
-- comandante, secretario o tesorero (`aspirante` no está en esa lista), y
-- capitán exige que la unidad del objetivo coincida con la suya, cosa que un
-- aspirante nunca cumple porque no tiene unidad.
--
-- Teniente y capitán sí necesitan, para revisar un examen (07), poder leer el
-- NOMBRE de un aspirante, algo que hoy no pueden (un teniente no ve a nadie
-- fuera de sí mismo). Se añade una cláusula acotada solo a `rango =
-- 'aspirante'` en `perfiles_lectura` (sección 2). Comandante, secretario y
-- tesorero ya lo veían con las cláusulas que trae el 05, que no miran el
-- rango del objetivo.
-- ============================================================================


-- ############################################################################
-- ############################################################################
-- ##                                                                        ##
-- ##   PARTE A. EJECUTA SOLO ESTO, SELECCIONANDO ESTA LÍNEA.                ##
-- ##                                                                        ##
-- ##   Mismo motivo que en 05_cargos_junta.sql: el valor recién añadido NO   ##
-- ##   se puede usar (en una función, una política o una restricción) hasta ##
-- ##   que esta transacción termine. Lanzarlo todo junto da el error 55P04  ##
-- ##   y aborta sin dejar nada aplicado.                                    ##
-- ##                                                                        ##
-- ##   Se añade al final del enum, como los cargos de Junta. Su posición no ##
-- ##   significa nada, un aspirante está fuera del escalafón.              ##
-- ##                                                                        ##
-- ############################################################################
-- ############################################################################

alter type public.rango add value if not exists 'aspirante';

-- ############################################################################
-- ##   FIN DE LA PARTE A. Antes de seguir, comprueba que el enum ya lista    ##
-- ##   los ocho valores:                                                     ##
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
-- 1. UN ASPIRANTE NUNCA TIENE UNIDAD
-- ============================================================================
-- En la base de datos y no solo en la pantalla, mismo criterio que
-- `perfiles_cargo_junta_sin_unidad` del 05. Se añade solo si no existe ya y
-- solo si los datos lo permiten, avisando en vez de romper.
do $$
begin
  if exists (
    select 1 from pg_constraint
     where conname = 'perfiles_aspirante_sin_unidad'
       and conrelid = 'public.perfiles'::regclass
  ) then
    raise notice 'FASOR: la restricción perfiles_aspirante_sin_unidad ya existía, no se toca.';

  elsif exists (
    select 1 from public.perfiles
     where rango = 'aspirante' and unidad is not null
  ) then
    raise warning 'FASOR: hay perfiles de aspirante CON unidad, así que no se ha podido crear la restricción. Pon esas unidades a null y vuelve a ejecutar esta sección.';

  else
    alter table public.perfiles
      add constraint perfiles_aspirante_sin_unidad
      check (rango <> 'aspirante' or unidad is null);
  end if;
end
$$;


-- ============================================================================
-- 2. TENIENTE Y CAPITÁN PUEDEN LEER EL NOMBRE DE UN ASPIRANTE
-- ============================================================================
-- Reemplaza la política del 05. La repite entera y añade una sola cláusula.
-- Comandante y los cargos de Junta ya veían a un aspirante con las cláusulas
-- que trae el 05 (no miran el rango del objetivo, alcanzan a cualquier fila);
-- la cláusula nueva le da a teniente y capitán, que hoy no ven a nadie fuera
-- de su unidad, la visibilidad mínima para revisar un examen, acotada
-- exclusivamente a filas con `rango = 'aspirante'`. No les da nada más: la
-- gestión de un aspirante (crear, editar, dar de baja) la sigue decidiendo
-- `puede_gestionar()`, que no cambia en este archivo y que ya los excluye a
-- los dos.
--
-- ESTE ARCHIVO MANDA SOBRE EL 05 PARA ESTA POLÍTICA. Si algún día se vuelve a
-- ejecutar el 05, hay que ejecutar este a continuación, o teniente y capitán
-- pierden esa visibilidad.
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
  or (public.mi_rango() in ('teniente', 'capitan') and rango = 'aspirante')
);


-- ============================================================================
-- 3. UN ASPIRANTE NO ENVÍA NI RECIBE MENSAJES
-- ============================================================================
-- Dos capas independientes: la política de alta (lo que ve el cliente normal)
-- y el trigger de antes de insertar (que también corre para la clave de
-- servicio, así que ni un error del cliente ni una llamada directa a la API
-- se lo saltan).

-- Función de ayuda, mismo patrón que `es_miembro_activo()` del 03.
create or replace function public.es_aspirante(p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.perfiles p where p.id = p_id and p.rango = 'aspirante'
  )
$$;

-- Reemplaza la política del 03. La repite entera y añade las dos condiciones
-- nuevas, al final, para que se lea como una ampliación y no una reescritura.
drop policy if exists "mensajes_alta" on public.mensajes;
create policy "mensajes_alta"
on public.mensajes
for insert
to authenticated
with check (
  remitente = auth.uid()
  and public.mi_rango() is not null
  and destinatario is not null
  and destinatario is distinct from remitente
  and public.es_miembro_activo(destinatario)
  and not public.es_aspirante(remitente)
  and not public.es_aspirante(destinatario)
);

-- Reemplaza la función del 03. Añade dos comprobaciones explícitas, mismo
-- estilo que las de "cuenta de baja" que ya tenía, justo al lado de ellas.
create or replace function public.mensajes_antes_de_insertar()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  padre record;
begin
  if new.id is null then
    new.id := gen_random_uuid();
  end if;
  if new.creado_en is null then
    new.creado_en := now();
  end if;

  new.asunto := btrim(coalesce(new.asunto, ''));
  new.cuerpo := btrim(coalesce(new.cuerpo, ''));

  if new.asunto = '' then
    raise exception 'El mensaje necesita un asunto.';
  end if;
  if new.cuerpo = '' then
    raise exception 'El mensaje necesita un cuerpo.';
  end if;
  if new.remitente is null or new.destinatario is null then
    raise exception 'Un mensaje necesita remitente y destinatario.';
  end if;
  if new.remitente = new.destinatario then
    raise exception 'No puedes escribirte a ti mismo.';
  end if;

  -- Los de baja no envían ni reciben. La política de alta ya lo comprueba para
  -- quien entra por la web; esto lo cubre también para la clave de servicio.
  if not public.es_miembro_activo(new.remitente) then
    raise exception 'Una cuenta de baja no puede enviar mensajes.';
  end if;
  if not public.es_miembro_activo(new.destinatario) then
    raise exception 'No puedes escribir a un miembro que está de baja.';
  end if;

  -- Un aspirante está fuera del buzón por los dos lados. Defensa en
  -- profundidad, la política de alta ya lo comprueba para quien entra por la
  -- web; esto lo cubre también para la clave de servicio.
  if public.es_aspirante(new.remitente) then
    raise exception 'Un aspirante no puede enviar mensajes.';
  end if;
  if public.es_aspirante(new.destinatario) then
    raise exception 'No puedes escribir a un aspirante.';
  end if;

  if new.responde_a is not null then
    select m.id, m.hilo, m.remitente, m.destinatario
      into padre
      from public.mensajes m
     where m.id = new.responde_a;

    if padre.id is null then
      raise exception 'El mensaje al que respondes no existe.';
    end if;

    -- Solo se responde a un mensaje propio. Sin esto se podría enganchar una
    -- respuesta a la conversación de otros con solo acertar un identificador.
    if new.remitente is distinct from padre.remitente
       and new.remitente is distinct from padre.destinatario then
      raise exception 'No puedes responder a un mensaje que no es tuyo.';
    end if;

    new.hilo := coalesce(padre.hilo, padre.id);
  else
    new.hilo := new.id;
  end if;

  -- Un mensaje nace sin leer y sin archivar, lo pida quien lo pida.
  new.leido_en := null;
  new.archivado_remitente := false;
  new.archivado_destinatario := false;

  return new;
end
$$;

drop trigger if exists mensajes_antes_de_insertar on public.mensajes;
create trigger mensajes_antes_de_insertar
before insert on public.mensajes
for each row
execute function public.mensajes_antes_de_insertar();


-- ============================================================================
-- 4. UN ASPIRANTE NO APARECE EN EL DIRECTORIO, NI COMO ÉL NI PARA ÉL
-- ============================================================================
-- Reemplaza la vista del 03. `mi_rango() is not null` ya le impedía verlo a
-- él (era incompleto, un aspirante activo sí tiene `mi_rango() is not null`,
-- así que sin esto vería el directorio entero); la cláusula nueva sobre
-- `p.rango` cierra el otro lado, que nadie lo vea a él como remitente o
-- destinatario posible en el buzón de nadie.
drop view if exists public.directorio;
create view public.directorio as
  select p.id, p.nombre, p.rango, p.unidad, p.activo
    from public.perfiles p
   where public.mi_rango() is not null
     and public.mi_rango() is distinct from 'aspirante'
     and p.rango is distinct from 'aspirante';

do $$
begin
  begin
    execute 'alter view public.directorio set (security_invoker = false)';
  exception when others then
    raise notice 'FASOR: esta versión de PostgreSQL no admite security_invoker. La vista ya se evalúa con los permisos de su dueño, que es el comportamiento buscado.';
  end;
end
$$;

revoke all on public.directorio from anon;
grant select on public.directorio to authenticated;


-- ============================================================================
-- 5. COMPROBACIONES
-- ============================================================================

-- ---------------------------------------------------------------------------
-- (a) El enum tiene los ocho valores
-- ---------------------------------------------------------------------------
--     select enumlabel from pg_enum e join pg_type t on t.oid = e.enumtypid
--      where t.typname = 'rango' order by e.enumsortorder;

-- ---------------------------------------------------------------------------
-- (b) La restricción de unidad está puesta
-- ---------------------------------------------------------------------------
--     select conname, pg_get_constraintdef(oid)
--       from pg_constraint
--      where conrelid = 'public.perfiles'::regclass
--        and conname = 'perfiles_aspirante_sin_unidad';

-- ---------------------------------------------------------------------------
-- (c) Un aspirante no puede insertar en `mensajes`, en ningún sentido
-- ---------------------------------------------------------------------------
-- Necesita un aspirante y otro miembro activo cualquiera ya dados de alta.
-- TODO EL BLOQUE ACABA EN ROLLBACK.
--
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DEL-ASPIRANTE','role','authenticated')::text, true);
--
--       -- Debe FALLAR con «Un aspirante no puede enviar mensajes.»
--       insert into public.mensajes (remitente, destinatario, asunto, cuerpo)
--       values ('UUID-DEL-ASPIRANTE','UUID-DE-OTRO-MIEMBRO','Prueba','Prueba');
--     rollback;
--
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DE-OTRO-MIEMBRO','role','authenticated')::text, true);
--
--       -- Debe FALLAR con «No puedes escribir a un aspirante.»
--       insert into public.mensajes (remitente, destinatario, asunto, cuerpo)
--       values ('UUID-DE-OTRO-MIEMBRO','UUID-DEL-ASPIRANTE','Prueba','Prueba');
--     rollback;

-- ---------------------------------------------------------------------------
-- (d) El directorio no lo lista, y él no ve el directorio
-- ---------------------------------------------------------------------------
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DE-UN-TENIENTE','role','authenticated')::text, true);
--       -- No debe salir ninguna fila con rango 'aspirante'
--       select rango from public.directorio;
--     rollback;
--
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DEL-ASPIRANTE','role','authenticated')::text, true);
--       -- Debe devolver CERO filas
--       select count(*) from public.directorio;
--     rollback;

-- ---------------------------------------------------------------------------
-- (e) Un teniente sin unidad puede leer una fila de aspirante, y ninguna otra
-- ---------------------------------------------------------------------------
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DE-UN-TENIENTE','role','authenticated')::text, true);
--
--       -- Debe devolver la fila
--       select nombre, rango from public.perfiles where id = 'UUID-DEL-ASPIRANTE';
--
--       -- Debe devolver CERO filas si ese cadete no es de la unidad del teniente
--       -- (un teniente solo ve su propia ficha y las de aspirante, nada más)
--       select nombre, rango from public.perfiles where id = 'UUID-DE-UN-CADETE-AJENO';
--     rollback;

-- ---------------------------------------------------------------------------
-- (f) Comandante, secretario y tesorero ya pueden gestionar a un aspirante
-- ---------------------------------------------------------------------------
-- No hace falta simular identidad, es la misma `puede_gestionar()` de siempre
-- sin cambios. Con un secretario ya dado de alta:
--
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DEL-SECRETARIO','role','authenticated')::text, true);
--       select public.puede_gestionar('aspirante', null) as debe_ser_true;
--     rollback;


-- ============================================================================
-- 6. ADVERTENCIAS
-- ============================================================================
-- 1. UN VALOR DE ENUM NO SE PUEDE QUITAR. Si algún día sobra este rango, se
--    deja de usar, no se borra.
--
-- 2. ESTE ARCHIVO MANDA SOBRE EL 05 para `perfiles_lectura`. Si vuelves a
--    ejecutar el 05, ejecuta este a continuación, o teniente y capitán
--    pierden la visibilidad de un aspirante.
--
-- 3. ESTE ARCHIVO MANDA SOBRE EL 03 para `mensajes_alta` y
--    `mensajes_antes_de_insertar()`, y sobre el 03 (o el propio archivo) para
--    la vista `directorio`. Si vuelves a ejecutar el 03, ejecuta este a
--    continuación, o un aspirante vuelve a poder mandar y recibir mensajes y
--    a aparecer en el directorio.
--
-- 4. LAS FUNCIONES EDGE HAY QUE REDESPLEGARLAS. `crear-miembro` valida el
--    rango contra su propia lista, así que hasta que no se redespliega
--    rechaza el alta de un aspirante con «El rango indicado no existe». Las
--    dos funciones importan el módulo común, así que van las dos:
--        npx supabase functions deploy crear-miembro --project-ref whmhunyqdtqjvaxxpyje
--        npx supabase functions deploy restablecer-contrasena --project-ref whmhunyqdtqjvaxxpyje
--
-- 5. LOS ASPIRANTES SE DAN DE ALTA DESDE EL APARTADO «Gestión de aspirantes»
--    de /enlace, no desde el formulario general de Gestión de Miembros (que
--    no ofrece «Aspirante» como opción a propósito). Solo lo ven y lo usan
--    comandante, secretario y tesorero.
