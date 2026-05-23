-- Initial schema for Horas Claras
-- Description: Creates profiles and work_logs tables with RLS and policies.

-- 1. Extensions
create extension if not exists "pgcrypto";

-- 2. Profiles Table
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    username text not null unique,
    developer_name text not null,
    role text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint profiles_username_check check (username in ('dev', 'compa')),
    constraint profiles_developer_name_check check (developer_name in ('dev', 'compa')),
    constraint profiles_role_check check (role in ('admin', 'user')),
    constraint profiles_username_devname_sync check (username = developer_name)
);

-- 3. Work Logs Table
create table public.work_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    developer_name text not null,
    created_by uuid not null references auth.users(id) on delete restrict,
    date date not null,
    start_time time not null,
    end_time time null,
    duration_hours numeric(5,2) not null,
    task_title text not null,
    description text not null,
    jira_loaded boolean not null default false,
    jira_loaded_at timestamptz null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint work_logs_developer_name_check check (developer_name in ('dev', 'compa')),
    constraint work_logs_duration_hours_check check (duration_hours > 0),
    constraint work_logs_task_title_not_empty check (length(trim(task_title)) > 0),
    constraint work_logs_description_not_empty check (length(trim(description)) > 0),
    constraint work_logs_time_order_check check (end_time is null or end_time > start_time),
    constraint work_logs_jira_loaded_consistency check (
        (jira_loaded = true and jira_loaded_at is not null) or
        (jira_loaded = false and jira_loaded_at is null)
    )
);

-- 4. Indices
create index idx_profiles_role on public.profiles(role);
create index idx_profiles_developer_name on public.profiles(developer_name);
create index idx_work_logs_user_id on public.work_logs(user_id);
create index idx_work_logs_created_by on public.work_logs(created_by);
create index idx_work_logs_developer_name on public.work_logs(developer_name);
create index idx_work_logs_date on public.work_logs(date);
create index idx_work_logs_jira_loaded on public.work_logs(jira_loaded);
create index idx_work_logs_date_jira_loaded on public.work_logs(date, jira_loaded);

-- 5. Helper Functions
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- 6. Triggers for updated_at
create trigger profiles_set_updated_at
    before update on public.profiles
    for each row execute function public.set_updated_at();

create trigger work_logs_set_updated_at
    before update on public.work_logs
    for each row execute function public.set_updated_at();

-- 7. Role and Auth Functions
create or replace function public.get_current_user_role()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
    user_role text;
begin
    select role into user_role
    from public.profiles
    where id = auth.uid();
    
  return user_role;
end;
$$;

-- 8. Admin check
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return coalesce(public.get_current_user_role() = 'admin', false);
end;
$$;

-- 9. Get developer name
create or replace function public.get_profile_developer_name(profile_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
    dev_name text;
begin
    select developer_name into dev_name
    from public.profiles
    where id = profile_id;
    
    return dev_name;
end;
$$;

-- 10. Restricted changes function
create or replace function public.prevent_non_admin_work_log_restricted_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    -- If user is admin, allow everything
    if public.is_admin() then
        return new;
    end if;

    -- Check if record was already loaded in Jira
    if old.jira_loaded then
        raise exception 'No se puede modificar un registro que ya ha sido cargado en Jira.';
    end if;

    -- Prevent changing restricted fields
    if new.user_id <> old.user_id then
        raise exception 'No tienes permisos para cambiar el usuario del registro.';
    end if;

    if new.developer_name <> old.developer_name then
        raise exception 'No tienes permisos para cambiar el nombre de desarrollador.';
    end if;

    if new.created_by <> old.created_by then
        raise exception 'No tienes permisos para cambiar quién creó el registro.';
    end if;

    if new.jira_loaded <> old.jira_loaded then
        raise exception 'Solo un administrador puede marcar registros como cargados en Jira.';
    end if;

    if new.jira_loaded_at is distinct from old.jira_loaded_at then
        raise exception 'No tienes permisos para modificar la fecha de carga en Jira.';
    end if;

    return new;
end;
$$;

-- 11. Trigger for restricted changes
create trigger work_logs_restricted_changes
    before update on public.work_logs
    for each row execute function public.prevent_non_admin_work_log_restricted_changes();

-- 12. Enable RLS
alter table public.profiles enable row level security;
alter table public.work_logs enable row level security;

-- 13. Policies for Profiles
create policy "Users can view their own profile"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Admins can view all profiles"
    on public.profiles for select
    using (public.is_admin());

-- 14. Policies for Work Logs

-- SELECT
create policy "Admins can view all work logs"
    on public.work_logs for select
    using (public.is_admin());

create policy "Users can view their own work logs"
    on public.work_logs for select
    using (auth.uid() = user_id);

-- INSERT
create policy "Anyone authenticated can insert work logs with restrictions"
    on public.work_logs for insert
    with check (
        -- created_by must be the current user
        created_by = auth.uid()
        -- developer_name must match the target user's profile
        and developer_name = public.get_profile_developer_name(user_id)
        and (
            -- If admin, can insert for anyone
            public.is_admin()
            or (
                -- If regular user, must be for themselves
                user_id = auth.uid()
                -- Cannot insert as jira_loaded = true
                and jira_loaded = false
            )
        )
    );

-- UPDATE
create policy "Admins can update any work log"
    on public.work_logs for update
    using (public.is_admin())
    with check (public.is_admin());

create policy "Users can update their own work logs if not loaded in Jira"
    on public.work_logs for update
    using (
        auth.uid() = user_id 
        and jira_loaded = false
    )
    with check (
        auth.uid() = user_id 
        and jira_loaded = false
    );

-- DELETE
create policy "Admins can delete any work log"
    on public.work_logs for delete
    using (public.is_admin());

create policy "Users can delete their own work logs if not loaded in Jira"
    on public.work_logs for delete
    using (
        auth.uid() = user_id 
        and jira_loaded = false
    );

-- 15. Grants
grant usage on schema public to authenticated;
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.work_logs to authenticated;

-- Function grants
grant execute on function public.get_current_user_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.get_profile_developer_name(uuid) to authenticated;
grant execute on function public.set_updated_at() to authenticated;
grant execute on function public.prevent_non_admin_work_log_restricted_changes() to authenticated;
