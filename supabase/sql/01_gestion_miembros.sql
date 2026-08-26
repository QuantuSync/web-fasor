-- ============================================================================
-- FASOR, zona interna (/enlace)
-- Permisos de la tabla `perfiles` y jerarquía de gestión de miembros.
--
-- Dónde se ejecuta: Supabase Dashboard, SQL Editor del proyecto.
-- Es idempotente de principio a fin, así que se puede volver a ejecutar sin
-- miedo: cada política se borra antes de crearse y el renombrado del enum
-- comprueba primero si ya está hecho.
--
-- Jerarquía que implementa (la misma que aplican las funciones Edge):
--   comandante  gestiona a cualquier miembro, de cualquier rango y unidad.
--   capitan     gestiona solo teniente, operador y cadete de SU unidad.
--   resto       no gestiona a nadie.
-- Y por encima de todo, nadie cambia su propio rango ni su propia alta.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. El enum de unidad usaba 'aerea' donde el sitio usa 'drones'
-- ---------------------------------------------------------------------------
-- La unidad de Intervención Aérea se llama `drones` en src/data/unidades.ts,
-- que es la fuente de verdad del sitio. Se renombra el valor del enum para que
-- haya un solo vocabulario. `rename value` conserva las filas existentes.
do $$
begin
  if exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'unidad' and e.enumlabel = 'aerea'
  ) then
    alter type public.unidad rename value 'aerea' to 'drones';
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 2. RLS activo en perfiles
-- ---------------------------------------------------------------------------
-- Sin `force`, a propósito: las funciones de ayuda de más abajo son
-- `security definer` y necesitan leer la tabla sin que se les aplique la
-- política, que es justo lo que evita la recursión infinita.
alter table public.perfiles enable row level security;

-- ---------------------------------------------------------------------------
-- 3. Quién llama, leído del JWT y nunca del cliente
-- ---------------------------------------------------------------------------
-- Exigen `activo`: una cuenta dada de baja pierde todo poder de inmediato,
-- aunque conserve una sesión abierta.
create or replace function public.mi_rango()
returns public.rango
language sql
stable
security definer
set search_path = public
as $$
  select p.rango
  from public.perfiles p
  where p.id = auth.uid() and p.activo
$$;

create or replace function public.mi_unidad()
returns public.unidad
language sql
stable
security definer
set search_path = public
as $$
  select p.unidad
  from public.perfiles p
  where p.id = auth.uid() and p.activo
$$;

-- ---------------------------------------------------------------------------
-- 4. La jerarquía, en un solo sitio
-- ---------------------------------------------------------------------------
-- Toda política y toda función Edge acaba pasando por aquí. Recibe el rango y
-- la unidad del miembro objetivo, no su id, porque lo mismo sirve para decidir
-- si se puede editar una fila existente que si se puede crear una nueva.
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
    else false
  end
$$;

-- ---------------------------------------------------------------------------
-- 5. Políticas
-- ---------------------------------------------------------------------------

-- Lectura: el propio perfil siempre; el comandante ve a todos; el capitán ve
-- su unidad. Un cadete solo se ve a sí mismo.
drop policy if exists "perfiles_lectura" on public.perfiles;
create policy "perfiles_lectura"
on public.perfiles
for select
to authenticated
using (
  id = auth.uid()
  or public.mi_rango() = 'comandante'
  or (public.mi_rango() = 'capitan' and unidad is not null and unidad = public.mi_unidad())
);

-- Alta: solo si quien llama puede gestionar al miembro que va a nacer.
drop policy if exists "perfiles_alta" on public.perfiles;
create policy "perfiles_alta"
on public.perfiles
for insert
to authenticated
with check (public.puede_gestionar(rango, unidad));

-- Edición: la fila vieja tiene que ser gestionable (`using`) Y la nueva
-- también (`with check`). Esa segunda mitad es la que impide que un capitán
-- mueva a alguien a otra unidad o lo ascienda por encima de teniente: la fila
-- resultante dejaría de ser suya y el `with check` la rechaza.
drop policy if exists "perfiles_edicion" on public.perfiles;
create policy "perfiles_edicion"
on public.perfiles
for update
to authenticated
using (public.puede_gestionar(rango, unidad))
with check (public.puede_gestionar(rango, unidad));

-- Sin política de DELETE a propósito: las cuentas no se borran nunca, se dan
-- de baja con `activo = false`.
drop policy if exists "perfiles_borrado" on public.perfiles;

-- ---------------------------------------------------------------------------
-- 6. Lo que RLS no puede ver: qué columna ha cambiado
-- ---------------------------------------------------------------------------
-- Una política decide sobre filas enteras, así que no distingue «cambió el
-- nombre» de «se ascendió a sí mismo». Eso lo cubre este trigger.
create or replace function public.perfiles_protecciones()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.id is distinct from old.id then
    raise exception 'El identificador de un perfil no se puede cambiar';
  end if;

  if new.id = auth.uid() then
    if new.rango is distinct from old.rango then
      raise exception 'No puedes cambiar tu propio rango';
    end if;
    if new.activo is distinct from old.activo then
      raise exception 'No puedes cambiar tu propia alta';
    end if;
  end if;

  return new;
end
$$;

drop trigger if exists perfiles_protecciones on public.perfiles;
create trigger perfiles_protecciones
before update on public.perfiles
for each row
execute function public.perfiles_protecciones();

-- ---------------------------------------------------------------------------
-- 7. Comprobaciones
-- ---------------------------------------------------------------------------
-- Ejecuta estas tres consultas después del script y revisa el resultado.

-- (a) El enum de unidad debe listar drones y no aerea:
--     select enumlabel from pg_enum e join pg_type t on t.oid = e.enumtypid
--     where t.typname = 'unidad' order by e.enumsortorder;

-- (b) Deben aparecer las tres políticas (lectura, alta, edición) y ninguna de
--     borrado:
--     select policyname, cmd from pg_policies
--     where schemaname = 'public' and tablename = 'perfiles' order by policyname;

-- (c) El comandante de arranque debe existir y estar activo. Debe devolver
--     exactamente una fila con rango 'comandante' y activo = true:
--     select p.nombre, p.rango, p.unidad, p.activo
--     from public.perfiles p
--     join auth.users u on u.id = p.id
--     where u.email = 'presidencia@fasor.es';
