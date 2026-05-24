'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listTasks } from '@/lib/api';
import type { Task } from '@/types';
import TaskCard from '@/components/TaskCard';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'mine' | 'created'>('all');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await listTasks({ filter: filter === 'all' ? undefined : filter });
        setTasks(data);
      } catch (err) {
        console.error('Failed to load tasks', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filter]);

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Task Directory</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage and track all tasks across the workspace.</p>
        </div>
        <Link href="/tasks/new" className="btn-primary">
          + New Task
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
        <button 
          className={`btn-secondary ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
          style={filter === 'all' ? { background: 'var(--bg-surface-elevated)', borderColor: 'var(--primary)', color: 'white' } : {}}
        >
          All Tasks
        </button>
        <button 
          className={`btn-secondary ${filter === 'mine' ? 'active' : ''}`}
          onClick={() => setFilter('mine')}
          style={filter === 'mine' ? { background: 'var(--bg-surface-elevated)', borderColor: 'var(--primary)', color: 'white' } : {}}
        >
          Assigned to Me
        </button>
        <button 
          className={`btn-secondary ${filter === 'created' ? 'active' : ''}`}
          onClick={() => setFilter('created')}
          style={filter === 'created' ? { background: 'var(--bg-surface-elevated)', borderColor: 'var(--primary)', color: 'white' } : {}}
        >
          Created by Me
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-muted)' }}>Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '64px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📭</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>No tasks found</h3>
          <p style={{ color: 'var(--text-muted)' }}>There are no tasks matching your current filter.</p>
        </div>
      ) : (
        <div className="tasks-grid">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
