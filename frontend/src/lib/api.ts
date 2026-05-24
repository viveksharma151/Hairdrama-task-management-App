import { supabase } from './supabase';
import type {
  Task,
  User,
  CreateTaskPayload,
  UpdateTaskPayload,
} from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function syncUser(userData: {
  email: string;
  full_name: string;
  avatar_url: string;
}): Promise<User> {
  const { user } = await apiFetch<{ user: User }>('/api/auth/sync', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  return user;
}

export async function getMe(): Promise<User> {
  const { user } = await apiFetch<{ user: User }>('/api/auth/me');
  return user;
}

export async function listUsers(): Promise<User[]> {
  const { users } = await apiFetch<{ users: User[] }>('/api/users/');
  return users;
}

export interface TaskFilter {
  filter?: 'all' | 'mine' | 'created';
  status?: string;
  priority?: string;
}

export async function listTasks(filters: TaskFilter = {}): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters.filter) params.set('filter', filters.filter);
  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  const qs = params.toString() ? `?${params.toString()}` : '';
  const { tasks } = await apiFetch<{ tasks: Task[] }>(`/api/tasks/${qs}`);
  return tasks;
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const { task } = await apiFetch<{ task: Task }>('/api/tasks/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return task;
}

export async function getTask(id: string): Promise<Task> {
  const { task } = await apiFetch<{ task: Task }>(`/api/tasks/${id}`);
  return task;
}

export async function updateTask(
  id: string,
  payload: UpdateTaskPayload
): Promise<Task> {
  const { task } = await apiFetch<{ task: Task }>(`/api/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return task;
}

export async function deleteTask(id: string): Promise<void> {
  await apiFetch(`/api/tasks/${id}`, { method: 'DELETE' });
}
