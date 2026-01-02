-- Ensure required extensions
create extension if not exists "pgcrypto";

-- Core enums
do $$
begin
    if not exists (select 1 from pg_type where lower(typname) = 'userrole') then
        create type public."userRole" as enum ('guest', 'user', 'admin');
    end if;
    if not exists (select 1 from pg_type where lower(typname) = 'chatvisibility') then
        create type public."chatVisibility" as enum ('private', 'public');
    end if;
    if not exists (select 1 from pg_type where lower(typname) = 'messagerole') then
        create type public."messageRole" as enum ('assistant', 'user');
    end if;
    if not exists (select 1 from pg_type where lower(typname) = 'aipersonality') then
        create type public."aiPersonality" as enum (
            'FRIENDLY', 'CYNICAL', 'ROBOT', 'LISTENER', 'NERD', 'YODA', 'PROFESSIONAL', 'SILLY'
        );
    end if;
end
$$;

-- Users table 
create table if not exists public.users (
    id uuid primary key default gen_random_uuid(),
    email text not null unique,
    name text not null,
    image text,
    password text,
    role public."userRole" not null default 'user',
    "createdAt" timestamptz not null default now()
);

alter table public.users enable row level security;

-- User preferences (1:1 with users)
create table if not exists public.user_preferences (
    id uuid primary key default gen_random_uuid(),
    "userId" uuid not null unique references public.users(id) on delete cascade,
    personality public."aiPersonality" not null default 'FRIENDLY',
    nickname text,
    role text,
    characteristics text,
    "extraInfo" text,
    "createdAt" timestamptz not null default now()
);

-- Chats
create table if not exists public.chats (
    id text primary key,
    "userId" uuid not null references public.users(id) on delete cascade,
    title text not null,
    visibility public."chatVisibility" not null default 'private',
    "visibleAt" timestamptz not null default now(),
    "createdAt" timestamptz not null default now(),
    "updatedAt" timestamptz not null default now()
);

-- Messages
create table if not exists public.messages (
    id text primary key,
    "chatId" text references public.chats(id) on delete cascade,
    "userId" uuid references public.users(id) on delete set null,
    role public."messageRole" not null,
    content text,
    metadata jsonb not null default '{}'::jsonb,
    parts jsonb[] not null default '{}'::jsonb[],
    "createdAt" timestamptz not null default now()
);

-- Files rate limits
create table if not exists public.user_files_rate_limits (
    id uuid primary key default gen_random_uuid(),
    "userId" uuid not null references public.users(id) on delete cascade,
    "filesCounter" integer not null default 0,
    "isOverLimit" boolean not null default false,
    "periodStart" timestamptz,
    "periodEnd" timestamptz,
    "createdAt" timestamptz not null default now(),
    "updatedAt" timestamptz not null default now()
);

-- Messages rate limits
create table if not exists public.user_messages_rate_limits (
    id uuid primary key default gen_random_uuid(),
    "userId" uuid not null references public.users(id) on delete cascade,
    "messagesCounter" integer not null default 0,
    "tokensCounter" integer not null default 0,
    "isOverLimit" boolean not null default false,
    "periodStart" timestamptz,
    "periodEnd" timestamptz,
    "createdAt" timestamptz not null default now(),
    "updatedAt" timestamptz not null default now()
);


