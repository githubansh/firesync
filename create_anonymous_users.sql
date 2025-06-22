-- Manual SQL script to create anonymous users in your Supabase database
-- Run this in your Supabase SQL Editor or dashboard

-- Create Anonymous User 1
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin
) VALUES (
    '11111111-1111-1111-1111-111111111111'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated',
    'authenticated',
    'anon1@system.local',
    '$2a$10$DuEJGgCl5w4I5H/XQdHw6e5vhLRAPx5vqFXaKUhW2z7HjP6K4fZ/i',
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "system", "providers": ["system"]}',
    '{"name": "Anonymous User 1", "system_user": true}',
    false
) ON CONFLICT (id) DO NOTHING;

-- Create Anonymous User 2
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin
) VALUES (
    '22222222-2222-2222-2222-222222222222'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated',
    'authenticated',
    'anon2@system.local',
    '$2a$10$DuEJGgCl5w4I5H/XQdHw6e5vhLRAPx5vqFXaKUhW2z7HjP6K4fZ/i',
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "system", "providers": ["system"]}',
    '{"name": "Anonymous User 2", "system_user": true}',
    false
) ON CONFLICT (id) DO NOTHING;

-- Create Anonymous User 3
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin
) VALUES (
    '33333333-3333-3333-3333-333333333333'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated',
    'authenticated',
    'anon3@system.local',
    '$2a$10$DuEJGgCl5w4I5H/XQdHw6e5vhLRAPx5vqFXaKUhW2z7HjP6K4fZ/i',
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "system", "providers": ["system"]}',
    '{"name": "Anonymous User 3", "system_user": true}',
    false
) ON CONFLICT (id) DO NOTHING;

-- Create Anonymous User 4
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin
) VALUES (
    '44444444-4444-4444-4444-444444444444'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated',
    'authenticated',
    'anon4@system.local',
    '$2a$10$DuEJGgCl5w4I5H/XQdHw6e5vhLRAPx5vqFXaKUhW2z7HjP6K4fZ/i',
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "system", "providers": ["system"]}',
    '{"name": "Anonymous User 4", "system_user": true}',
    false
) ON CONFLICT (id) DO NOTHING;

-- Create Anonymous User 5
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin
) VALUES (
    '55555555-5555-5555-5555-555555555555'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated',
    'authenticated',
    'anon5@system.local',
    '$2a$10$DuEJGgCl5w4I5H/XQdHw6e5vhLRAPx5vqFXaKUhW2z7HjP6K4fZ/i',
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "system", "providers": ["system"]}',
    '{"name": "Anonymous User 5", "system_user": true}',
    false
) ON CONFLICT (id) DO NOTHING;

-- Verify the users were created
SELECT id, email, raw_user_meta_data->>'name' as name, created_at 
FROM auth.users 
WHERE email LIKE 'anon%@system.local' 
ORDER BY email;
