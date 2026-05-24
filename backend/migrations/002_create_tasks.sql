-- Migration 002: Create tasks table
-- Run this in the Supabase SQL Editor (after 001)

CREATE TYPE task_status   AS ENUM ('todo', 'in_progress', 'done');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');

CREATE TABLE IF NOT EXISTS public.tasks (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    title        TEXT          NOT NULL,
    description  TEXT          DEFAULT '',
    status       task_status   NOT NULL DEFAULT 'todo',
    priority     task_priority NOT NULL DEFAULT 'medium',
    created_by   UUID          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    assigned_to  UUID          REFERENCES public.users(id) ON DELETE SET NULL,
    due_date     DATE,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every UPDATE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for common query patterns
CREATE INDEX idx_tasks_created_by  ON public.tasks(created_by);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status      ON public.tasks(status);
CREATE INDEX idx_tasks_created_at  ON public.tasks(created_at DESC);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.tasks IS 'Task management records.';
