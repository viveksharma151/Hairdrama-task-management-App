-- Migration 001: Create users table
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.users (
    id          UUID        PRIMARY KEY,  -- matches auth.users.id
    email       TEXT        NOT NULL UNIQUE,
    full_name   TEXT        NOT NULL DEFAULT '',
    avatar_url  TEXT        DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Allow the app to read users (needed for assignment dropdowns)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.users IS 'Application user profiles synced from Google OAuth.';
