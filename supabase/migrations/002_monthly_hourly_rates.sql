-- Monthly hourly rates table for developers
-- Description: Creates monthly_hourly_rates table with RLS, policies and updated_at trigger.

-- 1. Create table
create table public.monthly_hourly_rates (
    id uuid primary key default gen_random_uuid(),
    developer_name text not null,
    year integer not null,
    month integer not null,
    hourly_rate numeric(10,2) not null,
    created_by uuid references public.profiles(id) on delete restrict,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint monthly_hourly_rates_developer_name_check check (developer_name in ('dev', 'compa')),
    constraint monthly_hourly_rates_month_check check (month between 1 and 12),
    constraint monthly_hourly_rates_year_check check (year between 2000 and 2100),
    constraint monthly_hourly_rates_hourly_rate_check check (hourly_rate > 0),
    constraint monthly_hourly_rates_unique_rate unique (developer_name, year, month)
);

-- 2. Indices
create index idx_monthly_hourly_rates_dev_date on public.monthly_hourly_rates(developer_name, year, month);

-- 3. Trigger for updated_at
create trigger monthly_hourly_rates_set_updated_at
    before update on public.monthly_hourly_rates
    for each row execute function public.set_updated_at();

-- 4. Enable RLS
alter table public.monthly_hourly_rates enable row level security;

-- 5. Policies
create policy "Admins can view all monthly hourly rates"
    on public.monthly_hourly_rates for select
    using (public.is_admin());

create policy "Users can view their own monthly hourly rates"
    on public.monthly_hourly_rates for select
    using (developer_name = public.get_profile_developer_name(auth.uid()));

create policy "Admins can insert monthly hourly rates"
    on public.monthly_hourly_rates for insert
    with check (public.is_admin());

create policy "Admins can update monthly hourly rates"
    on public.monthly_hourly_rates for update
    using (public.is_admin())
    with check (public.is_admin());

-- 6. Grants
revoke all on public.monthly_hourly_rates from anon;
revoke all on public.monthly_hourly_rates from authenticated;
revoke all on public.monthly_hourly_rates from public;

grant select, insert, update on public.monthly_hourly_rates to authenticated;

