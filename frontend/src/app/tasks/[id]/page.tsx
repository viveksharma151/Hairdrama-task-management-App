'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTask, updateTask, listUsers, deleteTask, getMe } from '@/lib/api';
import type { Task, User, UpdateTaskPayload } from '@/types';
import Link from 'next/link';

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [me, setMe] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState<UpdateTaskPayload>({});

  useEffect(() => {
    async function load() {
      try {
        const [taskData, usersData, meData] = await Promise.all([
          getTask(params.id),
          listUsers(),
          getMe()
        ]);
        setTask(taskData);
        setUsers(usersData);
        setMe(meData);
        setForm({
          title: taskData.title,
          description: taskData.description || '',
          status: taskData.status,
          priority: taskData.priority,
          assigned_to: taskData.assigned_to || '',
          due_date: taskData.due_date || '',
        });
      } catch (err) {
        console.error(err);
        alert('Failed to load task');
        router.push('/tasks');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        assigned_to: form.assigned_to || null,
        due_date: form.due_date || null,
      };
      await updateTask(params.id, payload);
      alert('Task updated successfully!');
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(params.id);
      router.push('/tasks');
    } catch (err) {
      console.error(err);
      alert('Failed to delete task. Note: Only the creator can delete it.');
    }
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '64px' }}>Loading task...</div>;
  if (!task) return null;

  const isCreator = me?.id === task.created_by;
  const isAssignee = me?.id === task.assigned_to;
  const canEdit = isCreator || isAssignee;

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <Link href="/tasks" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>← Back to tasks</Link>
          <h1 style={{ fontSize: '2rem', marginTop: '16px' }}>Edit Task</h1>
        </div>
        {isCreator && (
          <button onClick={handleDelete} className="btn-secondary" style={{ color: 'var(--accent-danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            Delete Task
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Task Title *</label>
          <input 
            required 
            type="text" 
            value={form.title || ''}
            onChange={e => setForm({...form, title: e.target.value})}
            disabled={!canEdit}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Description</label>
          <textarea 
            rows={4}
            value={form.description || ''}
            onChange={e => setForm({...form, description: e.target.value})}
            disabled={!canEdit}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Status</label>
            <select 
              value={form.status || 'todo'} 
              onChange={e => setForm({...form, status: e.target.value as any})}
              disabled={!canEdit}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            {form.status === 'done' && task.status !== 'done' && (
              <p style={{ fontSize: '0.75rem', color: 'var(--accent-success)', marginTop: '8px' }}>
                Creator will be notified upon saving.
              </p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Assign To</label>
            <select 
              value={form.assigned_to || ''} 
              onChange={e => setForm({...form, assigned_to: e.target.value})}
              disabled={!canEdit}
            >
              <option value="">Unassigned</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
              ))}
            </select>
            {form.assigned_to !== task.assigned_to && form.assigned_to && (
              <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '8px' }}>
                New assignee will be notified.
              </p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Priority</label>
            <select 
              value={form.priority || 'medium'} 
              onChange={e => setForm({...form, priority: e.target.value as any})}
              disabled={!canEdit}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Due Date</label>
            <input 
              type="date"
              value={form.due_date || ''}
              onChange={e => setForm({...form, due_date: e.target.value})}
              style={{ colorScheme: 'dark' }}
              disabled={!canEdit}
            />
          </div>
        </div>

        {!canEdit && (
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
            You can only edit tasks that you created or are assigned to.
          </div>
        )}

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>
            Created by {task.creator?.full_name || task.creator?.email} on {new Date(task.created_at).toLocaleDateString()}
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link href="/dashboard" className="btn-secondary">Cancel</Link>
            {canEdit && (
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
