'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listTasks, getMe } from '@/lib/api';
import type { Task, User } from '@/types';
import TaskCard from '@/components/TaskCard';
import './dashboard.css';

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [profile, myTasks] = await Promise.all([
          getMe(),
          listTasks({ filter: 'mine' }), // Tasks assigned to me
        ]);
        setUser(profile);
        setTasks(myTasks);
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="container loader">Loading workspace...</div>;
  }

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  return (
    <div className="container dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="welcome-title">Welcome back, {user?.full_name?.split(' ')[0] || 'User'} 👋</h1>
          <p className="welcome-subtitle">Here's what requires your attention today.</p>
        </div>
        <Link href="/tasks/new" className="btn-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Create Task
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-value text-secondary">{todoTasks.length}</div>
          <div className="stat-label">To Do</div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-value text-warning">{inProgressTasks.length}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-value text-success">{doneTasks.length}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <div className="tasks-section">
        <div className="section-header">
          <h2>My Active Tasks</h2>
          <Link href="/tasks" className="view-all-link">View all tasks →</Link>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-state glass-panel">
            <div className="empty-icon">✨</div>
            <h3>You're all caught up!</h3>
            <p>No tasks assigned to you right now.</p>
          </div>
        ) : (
          <div className="tasks-grid">
            {tasks.slice(0, 6).map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
