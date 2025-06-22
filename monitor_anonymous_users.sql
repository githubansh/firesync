-- Query to check room counts for anonymous users
-- Run this periodically to monitor usage

SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data->>'name' as user_name,
    COUNT(r.id) as room_count,
    u.created_at as user_created_at
FROM auth.users u
LEFT JOIN rooms r ON r.host_id = u.id
WHERE u.email LIKE 'anon%@system.local'
GROUP BY u.id, u.email, u.raw_user_meta_data, u.created_at
ORDER BY room_count DESC, u.email;

-- Query to see recent rooms created by anonymous users
SELECT 
    r.id,
    r.code,
    r.name,
    r.status,
    r.created_at,
    u.email as host_email,
    u.raw_user_meta_data->>'name' as host_name
FROM rooms r
JOIN auth.users u ON r.host_id = u.id
WHERE u.email LIKE 'anon%@system.local'
ORDER BY r.created_at DESC
LIMIT 20;

-- Query to add a new anonymous user if needed (replace the number as needed)
/*
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
    '66666666-6666-6666-6666-666666666666'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated',
    'authenticated',
    'anon6@system.local',
    '$2a$10$DuEJGgCl5w4I5H/XQdHw6e5vhLRAPx5vqFXaKUhW2z7HjP6K4fZ/i',
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "system", "providers": ["system"]}',
    '{"name": "Anonymous User 6", "system_user": true}',
    false
) ON CONFLICT (id) DO NOTHING;
*/
