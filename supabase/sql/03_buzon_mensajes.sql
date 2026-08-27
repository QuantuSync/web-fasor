-- ============================================================================
-- FASOR, zona interna (/enlace)
-- Buzón interno de mensajes (fase 2) y avisos de cadena de mando.
--
-- Dónde se ejecuta: Supabase Dashboard, SQL Editor del proyecto.
-- Se ejecuta DESPUÉS de 01_gestion_miembros.sql y de 02_blindaje_rango_propio.sql.
--
-- Es idempotente de principio a fin y NO SUPONE NINGÚN ESTADO PREVIO. Se
-- escribió sin poder mirar la base de datos, así que no da por hecho que la
-- tabla `mensajes` exista, ni que exista con esta forma. Cada tabla se crea con
-- `create table if not exists`, cada columna se añade con `add column if not
-- exists`, cada política se borra antes de crearse y cada ajuste que podría
-- chocar con datos ya guardados va dentro de un bloque que comprueba primero y
-- avisa con `raise warning` en lugar de romper.
--
-- Lo que este archivo NO puede resolver solo está anotado al final, en
-- ADVERTENCIAS. Léelo después de ejecutar.
--
-- La tabla `destinatarios`, si existe de una versión anterior, NO se toca: ni
-- se borra, ni se modifica, ni se lee. El modelo nuevo no la usa (ver
-- ADVERTENCIAS, punto 5).
-- ============================================================================


-- ============================================================================
-- 0. DIAGNÓSTICO (consultas comentadas, ejecútalas cuando quieras)
-- ============================================================================
-- Sirven para dos cosas: mirar cómo estaba esto ANTES de ejecutar el archivo, y
-- confirmar DESPUÉS que quedó como se esperaba. Son de solo lectura.
--
-- (0.a) Forma de las tablas del buzón:
--     select table_name, column_name, data_type, is_nullable, column_default
--       from information_schema.columns
--      where table_schema = 'public'
--        and table_name in ('mensajes', 'avisos_cadena', 'destinatarios')
--      order by table_name, ordinal_position;
--
-- (0.b) Políticas RLS vigentes sobre esas tablas:
--     select tablename, policyname, cmd, qual, with_check
--       from pg_policies
--      where schemaname = 'public'
--        and tablename in ('mensajes', 'avisos_cadena', 'destinatarios')
--      order by tablename, policyname;
--
-- (0.c) Valores del enum de rango (el código espera estos cinco):
--     select enumlabel from pg_enum e join pg_type t on t.oid = e.enumtypid
--      where t.typname = 'rango' order by e.enumsortorder;
--
-- (0.d) Claves ajenas de las dos tablas. IMPORTANTE: en `avisos_cadena` no debe
--       aparecer NINGUNA hacia `mensajes`. Si apareciera, alguien habrá
--       ampliado el aviso por descuido y hay que quitarla (ver sección 2):
--     select c.conname, c.conrelid::regclass as tabla,
--            c.confrelid::regclass as apunta_a,
--            pg_get_constraintdef(c.oid) as definicion
--       from pg_constraint c
--      where c.contype = 'f'
--        and c.conrelid in ('public.mensajes'::regclass, 'public.avisos_cadena'::regclass)
--      order by tabla, conname;
--
-- (0.e) ¿Existe todavía la tabla `destinatarios` de la versión anterior?
--     select to_regclass('public.destinatarios') as destinatarios;


-- ============================================================================
-- 1. REQUISITOS PREVIOS
-- ============================================================================
-- Si falta lo del archivo 01, mejor parar aquí con un mensaje claro que dejar
-- media instalación puesta.
do $$
begin
  if to_regclass('public.perfiles') is null then
    raise exception 'FASOR: falta la tabla public.perfiles. Ejecuta antes 01_gestion_miembros.sql.';
  end if;
  if to_regprocedure('public.mi_rango()') is null then
    raise exception 'FASOR: falta la función public.mi_rango(). Ejecuta antes 01_gestion_miembros.sql.';
  end if;
end
$$;


-- ============================================================================
-- 2. LAS DOS TABLAS, Y POR QUÉ SON DOS
-- ============================================================================
-- `mensajes` guarda la comunicación. `avisos_cadena` guarda solo el HECHO de
-- que alguien ha escrito saltándose la cadena de mando.
--
-- La separación NO es de comodidad, es la garantía de privacidad del sistema:
--
--     `avisos_cadena` NO TIENE NI TENDRÁ NINGUNA COLUMNA QUE APUNTE A
--     `mensajes`. Ni clave ajena, ni identificador suelto, ni asunto, ni un
--     resumen.
--
-- Un aviso dice quién ha escrito, a quién y cuándo. Nada más. El mando se
-- entera de que ha ocurrido, no de lo que se dijo, y no hay forma de llegar del
-- aviso al mensaje, ni siquiera por referencia, porque el dato no existe en la
-- fila. Si los avisos vivieran dentro de `mensajes` con una columna `tipo`,
-- habría que dejar `asunto` y `cuerpo` nulos y quedaría abierta la tentación de
-- rellenarlos algún día. Esto es deliberado, NO SE AMPLÍE.

create table if not exists public.mensajes (
  id uuid primary key default gen_random_uuid(),
  remitente uuid not null,
  destinatario uuid not null,
  asunto text not null,
  cuerpo text not null,
  creado_en timestamptz not null default now(),
  leido_en timestamptz,
  archivado_remitente boolean not null default false,
  archivado_destinatario boolean not null default false,
  responde_a uuid,
  hilo uuid
);

create table if not exists public.avisos_cadena (
  id uuid primary key default gen_random_uuid(),
  -- Quién RECIBE el aviso, es decir el superior inmediato del remitente
  mando uuid not null,
  -- Quién escribió y a quién. Y se acabó, aquí no hay nada del mensaje.
  remitente uuid not null,
  destinatario uuid not null,
  creado_en timestamptz not null default now(),
  leido_en timestamptz,
  archivado boolean not null default false
);

-- ---------------------------------------------------------------------------
-- 2.1 Columnas que pudieran faltar (tabla preexistente con otra forma)
-- ---------------------------------------------------------------------------
-- Se añaden SIEMPRE opcionales. Una columna nueva en una tabla con filas no
-- puede nacer obligatoria, así que la obligatoriedad se intenta después, en
-- 2.2, y solo si los datos lo permiten.
alter table public.mensajes add column if not exists id uuid;
alter table public.mensajes add column if not exists remitente uuid;
alter table public.mensajes add column if not exists destinatario uuid;
alter table public.mensajes add column if not exists asunto text;
alter table public.mensajes add column if not exists cuerpo text;
alter table public.mensajes add column if not exists creado_en timestamptz;
alter table public.mensajes add column if not exists leido_en timestamptz;
alter table public.mensajes add column if not exists archivado_remitente boolean;
alter table public.mensajes add column if not exists archivado_destinatario boolean;
alter table public.mensajes add column if not exists responde_a uuid;
alter table public.mensajes add column if not exists hilo uuid;

alter table public.avisos_cadena add column if not exists id uuid;
alter table public.avisos_cadena add column if not exists mando uuid;
alter table public.avisos_cadena add column if not exists remitente uuid;
alter table public.avisos_cadena add column if not exists destinatario uuid;
alter table public.avisos_cadena add column if not exists creado_en timestamptz;
alter table public.avisos_cadena add column if not exists leido_en timestamptz;
alter table public.avisos_cadena add column if not exists archivado boolean;

-- ---------------------------------------------------------------------------
-- 2.2 Valores por defecto y obligatoriedad, sin romper nada
-- ---------------------------------------------------------------------------
-- Para cada columna: si no existe, aviso. Si existe con otro tipo, aviso y no
-- se toca, porque cambiar el tipo de una columna con datos dentro no es
-- idempotente ni inocuo y aquí no se adivina. Si existe con el tipo esperado,
-- se le pone el valor por defecto y, si no hay filas con nulos, se marca
-- obligatoria.
do $$
declare
  fila record;
  tipo_real text;
  hay_nulos boolean;
begin
  for fila in
    select * from (values
      ('mensajes', 'id',                     'uuid',                     'gen_random_uuid()', true),
      ('mensajes', 'remitente',              'uuid',                     null,                true),
      ('mensajes', 'destinatario',           'uuid',                     null,                true),
      ('mensajes', 'asunto',                 'text',                     null,                true),
      ('mensajes', 'cuerpo',                 'text',                     null,                true),
      ('mensajes', 'creado_en',              'timestamp with time zone', 'now()',             true),
      ('mensajes', 'leido_en',               'timestamp with time zone', null,                false),
      ('mensajes', 'archivado_remitente',    'boolean',                  'false',             true),
      ('mensajes', 'archivado_destinatario', 'boolean',                  'false',             true),
      ('mensajes', 'responde_a',             'uuid',                     null,                false),
      ('mensajes', 'hilo',                   'uuid',                     null,                false),
      ('avisos_cadena', 'id',           'uuid',                     'gen_random_uuid()', true),
      ('avisos_cadena', 'mando',        'uuid',                     null,                true),
      ('avisos_cadena', 'remitente',    'uuid',                     null,                true),
      ('avisos_cadena', 'destinatario', 'uuid',                     null,                true),
      ('avisos_cadena', 'creado_en',    'timestamp with time zone', 'now()',             true),
      ('avisos_cadena', 'leido_en',     'timestamp with time zone', null,                false),
      ('avisos_cadena', 'archivado',    'boolean',                  'false',             true)
    ) as v(tabla, columna, tipo, defecto, obligatoria)
  loop
    select c.data_type into tipo_real
      from information_schema.columns c
     where c.table_schema = 'public'
       and c.table_name = fila.tabla
       and c.column_name = fila.columna;

    if tipo_real is null then
      raise warning 'FASOR: la columna %.% no existe y no se ha podido crear. Revísala a mano (ADVERTENCIAS, punto 1).',
        fila.tabla, fila.columna;
      continue;
    end if;

    if tipo_real is distinct from fila.tipo then
      raise warning 'FASOR: %.% es de tipo % y el código espera %. No se toca (ADVERTENCIAS, punto 1).',
        fila.tabla, fila.columna, tipo_real, fila.tipo;
      continue;
    end if;

    if fila.defecto is not null then
      execute format('alter table public.%I alter column %I set default %s',
        fila.tabla, fila.columna, fila.defecto);
    end if;

    if fila.obligatoria then
      execute format('select exists (select 1 from public.%I where %I is null)', fila.tabla, fila.columna)
        into hay_nulos;
      if hay_nulos then
        raise warning 'FASOR: %.% tiene filas con valor nulo, así que se queda opcional (ADVERTENCIAS, punto 2).',
          fila.tabla, fila.columna;
      else
        execute format('alter table public.%I alter column %I set not null', fila.tabla, fila.columna);
      end if;
    end if;
  end loop;
end
$$;

-- ---------------------------------------------------------------------------
-- 2.3 Claves ajenas
-- ---------------------------------------------------------------------------
-- Se crean solo si no están. Si chocaran con datos viejos (una fila que apunta
-- a un perfil inexistente), no se rompe la ejecución, se avisa y sigue.
--
-- `on delete cascade` hacia perfiles: un perfil no se borra nunca por la vía
-- normal, porque no hay política de DELETE, pero si algún día hay que atender
-- una supresión de datos, el borrado del perfil se lleva por delante su
-- correspondencia, que es justo lo que interesa.
do $$
declare
  fila record;
begin
  for fila in
    select * from (values
      ('mensajes_remitente_fkey',         'mensajes',      'remitente',    'perfiles', 'cascade'),
      ('mensajes_destinatario_fkey',      'mensajes',      'destinatario', 'perfiles', 'cascade'),
      ('mensajes_responde_a_fkey',        'mensajes',      'responde_a',   'mensajes', 'set null'),
      ('avisos_cadena_mando_fkey',        'avisos_cadena', 'mando',        'perfiles', 'cascade'),
      ('avisos_cadena_remitente_fkey',    'avisos_cadena', 'remitente',    'perfiles', 'cascade'),
      ('avisos_cadena_destinatario_fkey', 'avisos_cadena', 'destinatario', 'perfiles', 'cascade')
    ) as v(nombre, tabla, columna, apunta_a, al_borrar)
  loop
    if exists (
      select 1 from pg_constraint
       where conname = fila.nombre
         and conrelid = format('public.%I', fila.tabla)::regclass
    ) then
      continue;
    end if;

    begin
      execute format(
        'alter table public.%I add constraint %I foreign key (%I) references public.%I(id) on delete %s',
        fila.tabla, fila.nombre, fila.columna, fila.apunta_a, fila.al_borrar
      );
    exception when others then
      raise warning 'FASOR: no se ha podido crear la clave ajena % (%). ADVERTENCIAS, punto 3.',
        fila.nombre, sqlerrm;
    end;
  end loop;
end
$$;

-- ---------------------------------------------------------------------------
-- 2.4 Índices
-- ---------------------------------------------------------------------------
do $$
declare
  sentencia text;
begin
  foreach sentencia in array array[
    'create index if not exists mensajes_destinatario_idx on public.mensajes (destinatario, creado_en desc)',
    'create index if not exists mensajes_remitente_idx on public.mensajes (remitente, creado_en desc)',
    'create index if not exists mensajes_hilo_idx on public.mensajes (hilo)',
    'create index if not exists avisos_cadena_mando_idx on public.avisos_cadena (mando, creado_en desc)'
  ] loop
    begin
      execute sentencia;
    exception when others then
      raise warning 'FASOR: no se ha podido crear un índice (%). No es grave, solo rendimiento. [%]',
        sqlerrm, sentencia;
    end;
  end loop;
end
$$;


-- ============================================================================
-- 3. LA CADENA DE MANDO, EN UN SOLO SITIO
-- ============================================================================
-- Igual que `puede_gestionar()` en el archivo 01, la jerarquía se escribe una
-- vez y todo lo demás la consulta.

-- Posición en el escalafón. Mapa explícito a propósito, para no depender del
-- orden en que se declararan los valores del enum.
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
  end
$$;

-- Superior inmediato de cada rango. Cadete y operador dependen del teniente, el
-- teniente del capitán, el capitán del comandante. El comandante no tiene.
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
    else null
  end
$$;

-- ¿Ese miembro está de alta? `security definer` porque quien pregunta casi
-- nunca puede ver la fila del otro, ya que la política de lectura de perfiles
-- es estrecha a propósito.
create or replace function public.es_miembro_activo(p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.perfiles p where p.id = p_id and p.activo is true
  )
$$;


-- ============================================================================
-- 4. DIRECTORIO
-- ============================================================================
-- Problema real: la política de lectura de `perfiles` deja que un cadete se vea
-- SOLO A SÍ MISMO. Sin nada más no hay buscador de destinatario, ni forma de
-- poner nombre al remitente de un mensaje recibido.
--
-- Ampliar `perfiles_lectura` rompería la gestión de miembros, porque un capitán
-- pasaría a ver a toda la entidad en su lista. Así que en vez de tocar esa
-- política se publica esta vista, que:
--
--   * expone SOLO nombre, rango, unidad y alta. Ni identificador de acceso ni
--     nada que no haga falta para escribir un mensaje.
--   * se evalúa con los permisos de su dueño (sin `security_invoker`), así que
--     no arrastra la política de `perfiles`, que se queda exactamente como está.
--   * devuelve CERO FILAS a una cuenta de baja o sin perfil, porque `mi_rango()`
--     ya exige `activo`.
--
-- Incluye a los miembros de baja a propósito, para poder poner nombre al
-- remitente de un mensaje antiguo de alguien que ya no está. Escribirles es
-- otra cosa, y eso lo impide la política de alta de `mensajes`.
drop view if exists public.directorio;
create view public.directorio as
  select p.id, p.nombre, p.rango, p.unidad, p.activo
    from public.perfiles p
   where public.mi_rango() is not null;

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
-- 5. ANTES DE INSERTAR UN MENSAJE
-- ============================================================================
-- Calcula el hilo, valida la respuesta y limpia los campos de estado. Todo en
-- servidor: lo que mande el navegador en `hilo`, `leido_en` o los archivados se
-- ignora, se recalcula aquí.
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
-- 6. EL AVISO DE SALTO DE CADENA DE MANDO
-- ============================================================================
-- Se genera AQUÍ, en la base de datos, y no en el navegador. Un remitente no
-- puede evitarlo tocando el cliente ni llamando a la API a pelo.
--
-- Cuándo hay salto: cuando el destinatario tiene un rango ESTRICTAMENTE por
-- encima del superior inmediato del remitente.
--     cadete  a capitán      hay salto (su superior inmediato es el teniente)
--     cadete  a teniente     no hay salto
--     cadete  a operador     no hay salto
--     capitán a comandante   no hay salto (su superior inmediato ya es él)
--
-- Quién recibe el aviso: los miembros ACTIVOS del rango inmediatamente superior
-- al remitente que estén en SU MISMA unidad. Si no hay ninguno, o el remitente
-- no tiene unidad, no se avisa a nadie y el mensaje se envía igual.
--
-- QUÉ LLEVA EL AVISO, Y ESTO NO SE AMPLÍA: quién ha escrito, a quién y cuándo.
-- Ni asunto, ni cuerpo, ni el identificador del mensaje, ni un enlace, ni un
-- resumen. El mando se entera de que ha ocurrido, no de lo que se dijo.
--
-- El envío NUNCA se bloquea por esto. Todo el cuerpo va dentro de un bloque con
-- `exception`, que en plpgsql es una subtransacción: si fallara el registro del
-- aviso se deshace solo eso y el mensaje sale igual. Tragarse un error es algo
-- que hay que justificar, y la justificación es esa, el mensaje es lo principal
-- y el aviso es accesorio.
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

    rango_superior := public.superior_inmediato(rango_remitente);
    if rango_superior is null then
      return new;  -- el comandante no tiene superior al que saltarse
    end if;

    if public.nivel_rango(rango_destinatario) >= public.nivel_rango(rango_superior) then
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
-- 7. LO QUE RLS NO PUEDE VER, QUÉ COLUMNA CAMBIÓ
-- ============================================================================
-- Una política decide sobre filas enteras, así que no distingue «he marcado el
-- mensaje como leído» de «he reescrito lo que me dijeron». Eso lo cubre esto.
--
-- Misma lección que el archivo 02, las condiciones son siempre verdaderas o
-- falsas y NUNCA NULL (`actor is not null and ...`). Y aquí se falla CERRADO:
-- si no se sabe quién actúa, no se deja pasar el cambio. La vía de rescate, si
-- alguna vez hay que arreglar una fila a mano, es desactivar el trigger dentro
-- de una transacción, no debilitar la regla:
--     begin;
--       alter table public.mensajes disable trigger mensajes_protecciones;
--       ...
--       alter table public.mensajes enable trigger mensajes_protecciones;
--     commit;
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

  return new;
end
$$;

drop trigger if exists mensajes_protecciones on public.mensajes;
create trigger mensajes_protecciones
before update on public.mensajes
for each row
execute function public.mensajes_protecciones();

-- Lo mismo para el aviso. De un aviso solo se puede tocar si está leído y si
-- está archivado, y solo puede hacerlo el mando que lo recibió.
create or replace function public.avisos_cadena_protecciones()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
begin
  if new.id is distinct from old.id
     or new.mando is distinct from old.mando
     or new.remitente is distinct from old.remitente
     or new.destinatario is distinct from old.destinatario
     or new.creado_en is distinct from old.creado_en then
    raise exception 'Un aviso de cadena de mando no se modifica.';
  end if;

  if (new.leido_en is distinct from old.leido_en
      or new.archivado is distinct from old.archivado)
     and not (actor is not null and actor = old.mando) then
    raise exception 'Solo el mando que recibió el aviso puede marcarlo.';
  end if;

  return new;
end
$$;

drop trigger if exists avisos_cadena_protecciones on public.avisos_cadena;
create trigger avisos_cadena_protecciones
before update on public.avisos_cadena
for each row
execute function public.avisos_cadena_protecciones();


-- ============================================================================
-- 8. RLS Y POLÍTICAS
-- ============================================================================
alter table public.mensajes enable row level security;
alter table public.avisos_cadena enable row level security;

-- Se borran TODAS las políticas que hubiera antes sobre estas dos tablas, no
-- solo las de nombre conocido. Motivo: este archivo se escribió sin poder mirar
-- la base de datos, y una política permisiva heredada de una versión anterior
-- dejaría un agujero justo en lo que hay que garantizar, que nadie lea un
-- mensaje del que no es remitente ni destinatario. Debajo se crean las cinco
-- que sí valen.
do $$
declare
  fila record;
begin
  for fila in
    select tablename, policyname
      from pg_policies
     where schemaname = 'public'
       and tablename in ('mensajes', 'avisos_cadena')
  loop
    execute format('drop policy if exists %I on public.%I', fila.policyname, fila.tablename);
  end loop;
end
$$;

-- ---------------------------------------------------------------------------
-- 8.1 Mensajes
-- ---------------------------------------------------------------------------
-- Lectura: solo remitente y destinatario, y solo si quien pregunta está de
-- alta. `mi_rango()` ya exige `activo`, así que una cuenta de baja deja de leer
-- en el acto aunque conserve la sesión abierta.
create policy "mensajes_lectura"
on public.mensajes
for select
to authenticated
using (
  public.mi_rango() is not null
  and (remitente = auth.uid() or destinatario = auth.uid())
);

-- Alta: uno escribe siempre en su nombre, nunca en el de otro. Las dos partes
-- tienen que estar de alta, y no se escribe a uno mismo.
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
);

-- Edición: solo las dos partes, y solo para marcar leído o archivar. Qué
-- columna se puede tocar lo decide el trigger de la sección 7.
create policy "mensajes_edicion"
on public.mensajes
for update
to authenticated
using (
  public.mi_rango() is not null
  and (remitente = auth.uid() or destinatario = auth.uid())
)
with check (
  public.mi_rango() is not null
  and (remitente = auth.uid() or destinatario = auth.uid())
);

-- Sin política de DELETE a propósito: un mensaje no se borra, se archiva.

-- ---------------------------------------------------------------------------
-- 8.2 Avisos de cadena de mando
-- ---------------------------------------------------------------------------
-- Lectura: solo el mando que lo recibió.
create policy "avisos_cadena_lectura"
on public.avisos_cadena
for select
to authenticated
using (
  public.mi_rango() is not null
  and mando = auth.uid()
);

-- SIN POLÍTICA DE INSERT, y es deliberado: ningún cliente inserta avisos. El
-- único que puede es el trigger de la sección 6, que es `security definer` y no
-- pasa por RLS. Así un aviso no se puede fabricar ni suprimir desde fuera.

-- Edición: solo para marcar leído y archivar, y solo el mando.
create policy "avisos_cadena_edicion"
on public.avisos_cadena
for update
to authenticated
using (public.mi_rango() is not null and mando = auth.uid())
with check (public.mi_rango() is not null and mando = auth.uid());

-- Sin política de DELETE.

-- ---------------------------------------------------------------------------
-- 8.3 Permisos de tabla
-- ---------------------------------------------------------------------------
-- Las políticas solo entran en juego si el rol tiene permiso sobre la tabla. Se
-- dice explícitamente en lugar de fiarse de los privilegios por defecto del
-- proyecto, y se retira el borrado por si alguna vez se concedió.
revoke all on public.mensajes from anon;
revoke all on public.avisos_cadena from anon;

grant select, insert, update on public.mensajes to authenticated;
grant select, update on public.avisos_cadena to authenticated;

revoke delete on public.mensajes from authenticated;
revoke insert, delete on public.avisos_cadena from authenticated;


-- ============================================================================
-- 9. COMPROBACIONES
-- ============================================================================
-- Ejecuta esto después del archivo y revisa el resultado.
--
-- ---------------------------------------------------------------------------
-- (a) Las políticas que deben quedar, y ninguna más
-- ---------------------------------------------------------------------------
-- Deben salir exactamente cinco filas, mensajes_lectura (SELECT), mensajes_alta
-- (INSERT), mensajes_edicion (UPDATE), avisos_cadena_lectura (SELECT) y
-- avisos_cadena_edicion (UPDATE). Ni una de DELETE, ni una de INSERT sobre
-- avisos_cadena.
--
--     select tablename, policyname, cmd from pg_policies
--      where schemaname = 'public' and tablename in ('mensajes','avisos_cadena')
--      order by tablename, cmd, policyname;
--
-- ---------------------------------------------------------------------------
-- (b) El aviso no apunta al mensaje. Esta es LA comprobación de privacidad
-- ---------------------------------------------------------------------------
-- Debe devolver CERO filas. Si devuelve alguna, alguien ha añadido una columna
-- que enlaza el aviso con el mensaje y hay que quitarla.
--
--     select column_name from information_schema.columns
--      where table_schema = 'public' and table_name = 'avisos_cadena'
--        and (column_name like '%mensaje%' or column_name in ('asunto','cuerpo','hilo'));
--
-- ---------------------------------------------------------------------------
-- (c) Los triggers instalados
-- ---------------------------------------------------------------------------
-- Deben aparecer cuatro, mensajes_antes_de_insertar, mensajes_aviso_cadena,
-- mensajes_protecciones y avisos_cadena_protecciones, todos con 'O' (activos).
--
--     select c.relname as tabla, t.tgname as trigger, t.tgenabled as habilitado
--       from pg_trigger t join pg_class c on c.oid = t.tgrelid
--      where c.relname in ('mensajes','avisos_cadena') and not t.tgisinternal
--      order by tabla, trigger;
--
-- ---------------------------------------------------------------------------
-- (d) El salto de cadena, de verdad, con identidad simulada
-- ---------------------------------------------------------------------------
-- El SQL Editor corre sin sesión, así que `auth.uid()` es null. Se simulan las
-- claims del JWT igual que en el archivo 02 y se adopta el rol `authenticated`
-- para que además se apliquen las políticas.
--
-- TODO EL BLOQUE ACABA EN ROLLBACK, así que no deja nada.
-- Necesitas tres cuentas de la MISMA unidad, un cadete, un teniente y un
-- capitán. Esta consulta te da los identificadores:
--
--     select id, nombre, rango, unidad from public.perfiles
--      where activo order by rango, nombre;
--
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DEL-CADETE','role','authenticated')::text, true);
--
--       -- El cadete escribe al capitán de su unidad, aquí hay salto
--       insert into public.mensajes (remitente, destinatario, asunto, cuerpo)
--       values ('UUID-DEL-CADETE','UUID-DEL-CAPITAN','Prueba de salto','Cuerpo de prueba');
--
--       -- Debe haber UN aviso, dirigido al teniente de esa unidad, y sin rastro
--       -- del asunto ni del cuerpo por ninguna parte:
--       reset role;
--       select mando, remitente, destinatario, creado_en from public.avisos_cadena
--        order by creado_en desc limit 5;
--     rollback;
--
-- Repite el bloque cambiando el destinatario al TENIENTE de su unidad. Entonces
-- la consulta de avisos NO debe traer ninguno nuevo.
--
-- ---------------------------------------------------------------------------
-- (e) Nadie lee lo ajeno
-- ---------------------------------------------------------------------------
-- Con la identidad de un tercero que no participa en el mensaje, la lectura
-- debe devolver CERO filas, no un error. Eso es RLS haciendo su trabajo.
--
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DE-UN-TERCERO','role','authenticated')::text, true);
--       select count(*) from public.mensajes;        -- solo los suyos
--       select count(*) from public.avisos_cadena;   -- solo los suyos
--       select count(*) from public.directorio;      -- el directorio entero
--     rollback;
--
-- ---------------------------------------------------------------------------
-- (f) El directorio se cierra a una cuenta de baja
-- ---------------------------------------------------------------------------
-- Con la identidad de un miembro dado de baja, la vista debe devolver CERO
-- filas, y `mensajes` también.
--
--     begin;
--       set local role authenticated;
--       select set_config('request.jwt.claims',
--         json_build_object('sub','UUID-DE-UN-MIEMBRO-DE-BAJA','role','authenticated')::text, true);
--       select count(*) from public.directorio;   -- debe ser 0
--     rollback;


-- ============================================================================
-- 10. ADVERTENCIAS. LO QUE ESTE ARCHIVO NO PUEDE RESOLVER SOLO
-- ============================================================================
-- Este archivo se escribió sin poder mirar la base de datos. Todo lo que se
-- podía hacer de forma idempotente está hecho arriba; lo que no, está aquí, sin
-- adivinar. Después de ejecutar, mira los mensajes de aviso del SQL Editor (la
-- pestaña de mensajes o notices) y contrástalos con esta lista.
--
-- 1. COLUMNA CON OTRO TIPO. Si la tabla `mensajes` ya existía con columnas del
--    mismo nombre pero de otro tipo (por ejemplo `id` bigint en vez de uuid, o
--    `destinatario` de tipo text), verás un aviso de la sección 2.2 y esa
--    columna se ha dejado intacta. Cambiar el tipo de una columna con datos
--    dentro no es idempotente ni inocuo, así que NO se ha hecho. Hay que
--    decidirlo a mano, o convirtiendo la columna, o apartando la tabla vieja
--    (`alter table public.mensajes rename to mensajes_antiguos`) y volviendo a
--    ejecutar este archivo para que cree la tabla limpia. El código del sitio
--    espera los tipos declarados en la sección 2.
--
-- 2. COLUMNA QUE NO SE HA PODIDO MARCAR OBLIGATORIA. Si la tabla tenía filas
--    con nulos en una columna que debería ser obligatoria, se ha quedado
--    opcional y verás el aviso correspondiente. No es un agujero de seguridad,
--    porque la política de alta exige remitente y destinatario y el trigger de
--    la sección 5 rechaza asunto o cuerpo vacíos, pero conviene limpiar esas
--    filas y ejecutar después a mano:
--        alter table public.mensajes alter column <columna> set not null;
--
-- 3. CLAVE AJENA NO CREADA. Si alguna fila apunta a un perfil que ya no existe,
--    la clave ajena no se habrá podido crear y verás el aviso. Localiza las
--    filas huérfanas y decide qué hacer con ellas antes de reintentarlo:
--        select * from public.mensajes m
--         where not exists (select 1 from public.perfiles p where p.id = m.remitente);
--
-- 4. CLAVE PRIMARIA. Si `mensajes` existía sin clave primaria, este archivo NO
--    se la añade, porque hacerlo con datos duplicados dentro fallaría a medias.
--    Compruébalo con la consulta (0.a) y, si falta, decídelo a mano.
--
-- 5. LA TABLA `destinatarios`. Si existe de una versión anterior, sigue ahí
--    intacta: este archivo no la borra, ni la modifica, ni la lee. El modelo
--    nuevo no la necesita porque en esta fase un mensaje va SIEMPRE a una sola
--    persona (no hay envío a grupos), de modo que el destinatario es una
--    columna del propio mensaje y una tabla aparte solo añadiría una unión y un
--    juego de políticas más que mantener. Si algún día hay envío a varios, esa
--    tabla es exactamente la pieza que hará falta, y por eso se conserva en vez
--    de borrarse. Ojo con una cosa, si `destinatarios` tiene políticas RLS
--    propias, este archivo NO las ha tocado (la sección 8 solo limpia las de
--    `mensajes` y `avisos_cadena`). Revísalas con la consulta (0.b), y si esa
--    tabla ya no la usa nadie, lo más limpio es dejarla sin ninguna política,
--    que equivale a negarle el acceso a todo el mundo.
--
-- 6. POLÍTICAS ANTERIORES BORRADAS. La sección 8 borra TODAS las políticas que
--    hubiera sobre `mensajes` y `avisos_cadena`, no solo las de nombre
--    conocido, y crea las cinco de la comprobación (a). Fue una decisión
--    tomada a ciegas y a propósito, porque una política heredada y permisiva
--    dejaría un agujero justo donde no puede haberlo. Si la tabla vieja tenía
--    alguna que quisieras conservar, la consulta (0.b) ejecutada ANTES de este
--    archivo era el sitio donde verla.
--
-- 7. ESTE ARCHIVO SE QUEDÓ CORTO CON LOS RANGOS SIN NIVEL. La sección 6 decide
--    si hay salto de cadena comparando `nivel_rango()`, y esa función devuelve
--    NULL para los cargos de Junta Directiva (secretario y tesorero), que están
--    fuera del escalafón. Una comparación con NULL no vale falso, vale NULL, y
--    el IF no entra, así que la función seguía hasta el insert de avisos. Lo
--    corrige `05_cargos_junta.sql`, que REEMPLAZA `nivel_rango()`,
--    `superior_inmediato()` y `mensajes_aviso_cadena()`. Si vuelves a ejecutar
--    este archivo, ejecuta el 05 a continuación, o el fallo en abierto vuelve.
