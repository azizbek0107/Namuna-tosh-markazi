-- ==============================================================================
-- NAMUNA TOSH MARKAZI — STAGE 9: ADMIN AUTHORIZATION & RLS POLICIES
-- ==============================================================================
-- This script creates a server-enforced authorization model for administrators.
-- Front-end checks are only visual guards; all database actions are enforced here.

-- 1. Create dedicated admin membership table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id)
);

-- 2. Enable Row Level Security (RLS) on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 3. Create server-side helper function to check admin status
-- SECURITY DEFINER allows checking membership without exposing full table access to public
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$;

-- 4. RLS Policies on admin_users
-- Only authenticated users who are ALREADY verified admins can read the admin list
CREATE POLICY "Admins can view admin membership"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Disallow any public or ordinary authenticated insert/update/delete from the client.
-- Admin assignments must be made by a privileged database administrator via Supabase SQL editor
-- or a trusted backend script with the service-role key.

-- ==============================================================================
-- INSTRUCTIONS TO PROVISION THE FIRST ADMINISTRATOR ACCOUNT:
-- ==============================================================================
-- 1. Open your Supabase Dashboard -> Authentication -> Users.
-- 2. Click "Add User" -> "Create User" (provide the admin's email and strong temporary password).
--    (Ensure public signups are disabled in Authentication -> Providers -> Email -> Enable Signup: OFF).
-- 3. Copy the created user's UUID (e.g. '00000000-0000-0000-0000-000000000000').
-- 4. Execute the following SQL query in the Supabase SQL Editor:
--
--    INSERT INTO public.admin_users (user_id, role)
--    VALUES ('<COPIED_USER_UUID>', 'admin');
--
-- ==============================================================================

