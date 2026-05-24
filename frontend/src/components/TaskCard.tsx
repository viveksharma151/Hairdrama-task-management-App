import Link from 'next/link';
import type { Task } from '@/types';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  return (
    <Link href={`/tasks/${task.id}`} className="task-card glass-panel">
      <div className="task-card-header">
        <h3 className="task-title">{task.title}</h3>
        <span className={`badge badge-${task.status}`}>
          {task.status.replace('_', ' ')}
        </span>
      </div>
      
      {task.description && (
        <p className="task-desc">
          {task.description.length > 100 
            ? `${task.description.substring(0, 100)}...` 
            : task.description}
        </p>
      )}

      <div className="task-meta">
        <div className="task-meta-group">
          <span className={`badge badge-${task.priority}`}>{task.priority}</span>
          {task.due_date && (
            <span className={`date-label ${isOverdue ? 'text-danger' : ''}`}>
              📅 {new Date(task.due_date).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="task-users">
          {task.assignee ? (
            <div className="user-avatar-small tooltip" data-tooltip={`Assignee: ${task.assignee.full_name}`}>
              {task.assignee.avatar_url ? (
                <img src={task.assignee.avatar_url} alt="Assignee" />
              ) : (
                <span>{task.assignee.full_name?.charAt(0) || task.assignee.email.charAt(0)}</span>
              )}
            </div>
          ) : (
            <div className="user-avatar-small unassigned tooltip" data-tooltip="Unassigned">?</div>
          )}
        </div>
      </div>
    </Link>
  );
}
