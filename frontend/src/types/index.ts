export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  created_by: string;
  assigned_to?: string | null;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
  creator?: User;
  assignee?: User | null;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: string | null;
  due_date?: string | null;
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
