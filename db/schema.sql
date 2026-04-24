-- DVC Engineering CRM — Supabase Postgres Schema
-- Run this in the Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (engineers + director)
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text not null,
  role text not null check (role in ('director', 'engineer', 'admin')),
  region text,
  password_hash text not null,
  last_login timestamptz,
  active boolean default true,
  created_at timestamptz default now()
);

-- Leads table
create table if not exists leads (
  id text primary key, -- lpa_app_no or derived unique ID
  lpa_name text,
  lpa_app_no text,
  site_address text,
  application_type text,
  development_description text,
  decision text,
  decision_date date,
  valid_date date,
  uprn text,
  site_easting numeric,
  site_northing numeric,
  region text,
  source text, -- 'london_pld', 'surrey_hub', 'planning_api'
  project_type text, -- 'Extension', 'New Build', 'Loft', etc.
  readiness_score integer default 0,
  estimated_fee numeric default 0,
  status text default 'Cold' check (status in ('Hot', 'Warm', 'Cold')),
  stage text default 'Initial Contact' check (stage in (
    'Initial Contact', 'Awaiting Quote', 'Proposal Sent',
    'Survey Booked', 'In Progress', 'Won', 'Lost'
  )),
  contact_name text,
  email text,
  phone text,
  notes text,
  assigned_to uuid references users(id),
  calendar_event_id text,
  calendar_engineer text,
  next_event_date timestamptz,
  next_event_type text,
  last_contact timestamptz,
  auto_reengage boolean default false,
  days_post_decision integer generated always as (
    extract(day from now() - decision_date::timestamptz)::integer
  ) stored,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Import history
create table if not exists import_history (
  id uuid primary key default uuid_generate_v4(),
  imported_by uuid references users(id),
  source text not null,
  lpas text[],
  total_fetched integer default 0,
  total_imported integer default 0,
  filters jsonb,
  created_at timestamptz default now()
);

-- Email logs
create table if not exists email_logs (
  id uuid primary key default uuid_generate_v4(),
  lead_id text references leads(id),
  sent_by uuid references users(id),
  to_email text not null,
  from_email text not null,
  subject text,
  body text,
  message_id text,
  type text check (type in ('outreach', 'briefing', 'reengage', 'reminder', 'digest', 'warning')),
  status text default 'sent',
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists leads_status_idx on leads(status);
create index if not exists leads_stage_idx on leads(stage);
create index if not exists leads_region_idx on leads(region);
create index if not exists leads_lpa_name_idx on leads(lpa_name);
create index if not exists leads_readiness_score_idx on leads(readiness_score desc);
create index if not exists leads_last_contact_idx on leads(last_contact);
create index if not exists leads_decision_date_idx on leads(decision_date);
create index if not exists leads_assigned_to_idx on leads(assigned_to);

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at
  before update on leads
  for each row execute function update_updated_at();

-- Row level security (disable for server-side service role access)
alter table users enable row level security;
alter table leads enable row level security;
alter table import_history enable row level security;
alter table email_logs enable row level security;

-- Service role bypass (used by our server-side adminClient)
create policy "Service role full access - users" on users
  for all using (auth.role() = 'service_role');
create policy "Service role full access - leads" on leads
  for all using (auth.role() = 'service_role');
create policy "Service role full access - import_history" on import_history
  for all using (auth.role() = 'service_role');
create policy "Service role full access - email_logs" on email_logs
  for all using (auth.role() = 'service_role');

-- Seed: Insert director account (change password via Supabase SQL after deploy)
-- Password: DVC2024!Change (bcrypt hash below)
insert into users (email, name, role, password_hash) values (
  'jesan@dvceng.com',
  'Jesan Ahmed',
  'director',
  '$2b$10$rQZ9vPJydMjXW3gT4kV8/.K9HxTGQ7TlhwFQH/0JMwZFBj2n.Oiyu'
) on conflict (email) do nothing;
