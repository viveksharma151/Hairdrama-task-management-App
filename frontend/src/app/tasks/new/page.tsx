'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createTask, listUsers } from '@/lib/api';
import type { User, CreateTaskPayload } from '@/types';
import Link from 'next/link';

export default function NewTaskPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState<CreateTaskPayload>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assigned_to: '',
    due_date: '',
  });

  useEffect(() => {
    listUsers().then(setUsers).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        assigned_to: form.assigned_to || null,
        due_date: form.due_date || null,
      };
      await createTask(payload);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Link href="/tasks" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>← Back to tasks</Link>
        <h1 style={{ fontSize: '2rem', marginTop: '16px' }}>Create New Task</h1>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Task Title *</label>
          <input 
            required 
            type="text" 
            placeholder="E.g., Implement OAuth login"
            value={form.title}
            onChange={e => setForm({...form, title: e.target.value})}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Description</label>
          <textarea 
            rows={4}
            placeholder="Add details, acceptance criteria, etc."
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Assign To</label>
            <select 
              value={form.assigned_to || ''} 
              onChange={e => setForm({...form, assigned_to: e.target.value})}
            >
              <option value="">Unassigned</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
              ))}
            </select>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              Assignee will receive an email notification.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Due Date</label>
            <input 
              type="date"
              value={form.due_date || ''}
              onChange={e => setForm({...form, due_date: e.target.value})}
              style={{ colorScheme: 'dark' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Priority</label>
            <select 
              value={form.priority} 
              onChange={e => setForm({...form, priority: e.target.value as any})}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <Link href="/tasks" className="btn-secondary">Cancel</Link>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
