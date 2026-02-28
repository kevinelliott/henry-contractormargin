-- profiles table
create table if not exists public.profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique not null,
  business_name text not null default '',
  trade text not null default 'general' check (trade in ('hvac','plumbing','electrical','general')),
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can manage own profile" on public.profiles for all using (auth.uid() = user_id);

-- jobs table
create table if not exists public.jobs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  client_name text not null default '',
  job_type text not null default 'residential' check (job_type in ('residential','commercial')),
  status text not null default 'active' check (status in ('active','completed','invoiced')),
  estimated_revenue numeric not null default 0,
  actual_revenue numeric not null default 0,
  created_at timestamptz default now(),
  completed_at timestamptz
);
alter table public.jobs enable row level security;
create policy "Users can manage own jobs" on public.jobs for all using (auth.uid() = user_id);

-- labor_entries table
create table if not exists public.labor_entries (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references public.jobs(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  tech_name text not null,
  hours numeric not null default 0,
  hourly_rate numeric not null default 0,
  date date not null default current_date
);
alter table public.labor_entries enable row level security;
create policy "Users can manage own labor" on public.labor_entries for all using (auth.uid() = user_id);

-- material_entries table
create table if not exists public.material_entries (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references public.jobs(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  description text not null,
  cost numeric not null default 0,
  date date not null default current_date
);
alter table public.material_entries enable row level security;
create policy "Users can manage own materials" on public.material_entries for all using (auth.uid() = user_id);
