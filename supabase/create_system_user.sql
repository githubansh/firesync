-- Create a system user for anonymous rooms
-- This user will be used as the host_id for rooms created by anonymous users

INSERT INTO auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'system@anonymous.local',
  crypt('system_password', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "system", "providers": ["system"]}',
  '{"name": "System User", "role": "system"}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;
