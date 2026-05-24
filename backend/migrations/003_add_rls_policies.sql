-- Migration 003: Row Level Security (RLS) policies
-- The backend uses the service role key and bypasses RLS.
-- These policies protect direct Supabase client access.

-- ─── Users Table Policies ───────────────────────────────────────────────────

-- Authenticated users can read all profiles (for assignment dropdowns)
CREATE POLICY "Users are viewable by authenticated users"
    ON public.users FOR SELECT
    TO authenticated
    USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Service role can insert (backend syncs after OAuth)
CREATE POLICY "Service role can insert users"
    ON public.users FOR INSERT
    TO service_role
    WITH CHECK (true);

-- ─── Tasks Table Policies ────────────────────────────────────────────────────

-- Authenticated users can read all tasks
CREATE POLICY "Tasks are viewable by authenticated users"
    ON public.tasks FOR SELECT
    TO authenticated
    USING (true);

-- Any authenticated user can create tasks
CREATE POLICY "Authenticated users can create tasks"
    ON public.tasks FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- Only creator or assignee can update
CREATE POLICY "Creator or assignee can update task"
    ON public.tasks FOR UPDATE
    TO authenticated
    USING (auth.uid() = created_by OR auth.uid() = assigned_to);

-- Only creator can delete
CREATE POLICY "Only creator can delete task"
    ON public.tasks FOR DELETE
    TO authenticated
    USING (auth.uid() = created_by);
