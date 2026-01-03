
-- Users
insert into public.users (id, email, name, role, "createdAt")
values
    ('00000000-0000-0000-0000-000000000001', 'seed-user1@example.com', 'Seed User 1', 'user', now()),
    ('00000000-0000-0000-0000-000000000002', 'seed-user2@example.com', 'Seed User 2', 'user', now()),
    ('00000000-0000-0000-0000-000000000003', 'seed-admin@example.com', 'Seed Admin', 'admin', now()),
    ('00000000-0000-0000-0000-000000000010', 'seed-check-files@example.com', 'Check Files User', 'user', now()),
    ('00000000-0000-0000-0000-000000000011', 'seed-check-messages@example.com', 'Check Messages User', 'user', now()),
    ('00000000-0000-0000-0000-000000000020', 'seed-increment-files@example.com', 'Increment Files User', 'user', now()),
    ('00000000-0000-0000-0000-000000000021', 'seed-increment-messages@example.com', 'Increment Messages User', 'user', now()),
    ('00000000-0000-0000-0000-000000000030', 'seed-update-files@example.com', 'Update Files User', 'user', now()),
    ('00000000-0000-0000-0000-000000000031', 'seed-update-messages@example.com', 'Update Messages User', 'user', now())
on conflict (id) do nothing;

-- User preferences
insert into public.user_preferences ("userId", personality, nickname, "createdAt")
values
    ('00000000-0000-0000-0000-000000000001', 'FRIENDLY', 'Alpha', now()),
    ('00000000-0000-0000-0000-000000000002', 'NERD', 'Beta', now())
on conflict ("userId") do nothing;

-- Rate limits (files)
insert into public.user_files_rate_limits
    (id, "userId", "filesCounter", "isOverLimit", "periodStart", "periodEnd", "createdAt", "updatedAt")
values
    ('11111111-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 0, false, null, null, now(), now()),
    ('11111111-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 0, false, null, null, now(), now()),
    ('11111111-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000010', 11, false, null, null, now(), now()),
    ('11111111-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000020', 0, false, null, null, now(), now()),
    ('11111111-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000030', 0, false, null, null, now(), now())
on conflict (id) do nothing;

-- Rate limits (messages)
insert into public.user_messages_rate_limits
    (id, "userId", "messagesCounter", "tokensCounter", "isOverLimit", "periodStart", "periodEnd", "createdAt", "updatedAt")
values
    ('22222222-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 0, 0, false, null, null, now(), now()),
    ('22222222-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 101, 0, false, null, null, now(), now()),
    ('22222222-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000011', 0, 10001, false, null, null, now(), now()),
    ('22222222-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000021', 0, 0, false, null, null, now(), now()),
    ('22222222-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000031', 0, 0, false, null, null, now(), now())
on conflict (id) do nothing;

-- Chats (with distinct timestamps for proper ordering)
insert into public.chats (id, "userId", title, visibility, "visibleAt", "createdAt", "updatedAt")
values
    ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Seed Private Chat', 'private', '2024-01-01T00:00:00Z'::timestamptz, '2024-01-01T00:00:00Z'::timestamptz, '2024-01-01T00:00:00Z'::timestamptz),
    ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Seed Public Chat', 'public', '2024-01-01T00:00:01Z'::timestamptz, '2024-01-01T00:00:01Z'::timestamptz, '2024-01-01T00:00:01Z'::timestamptz),
    ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Seed User2 Chat', 'private', '2024-01-01T00:00:02Z'::timestamptz, '2024-01-01T00:00:02Z'::timestamptz, '2024-01-01T00:00:02Z'::timestamptz)
on conflict (id) do update set
    "userId" = EXCLUDED."userId",
    title = EXCLUDED.title,
    visibility = EXCLUDED.visibility,
    "visibleAt" = EXCLUDED."visibleAt",
    "createdAt" = EXCLUDED."createdAt",
    "updatedAt" = EXCLUDED."updatedAt";

-- Messages (with distinct timestamps for proper ordering)
insert into public.messages (id, "chatId", "userId", role, content, metadata, parts, "createdAt")
values
    ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'user', 'Hello from seed user 1', '{}'::jsonb, ARRAY[]::jsonb[], '2024-01-01T00:00:00Z'::timestamptz),
    ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'assistant', 'Hello, seed!', '{}'::jsonb, ARRAY[]::jsonb[], '2024-01-01T00:00:01Z'::timestamptz),
    ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'user', 'Public chat message', '{}'::jsonb, ARRAY[]::jsonb[], '2024-01-01T00:00:00Z'::timestamptz)
on conflict (id) do update set
    "chatId" = EXCLUDED."chatId",
    "userId" = EXCLUDED."userId",
    role = EXCLUDED.role,
    content = EXCLUDED.content,
    metadata = EXCLUDED.metadata,
    parts = EXCLUDED.parts,
    "createdAt" = EXCLUDED."createdAt";


