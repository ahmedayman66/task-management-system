import React from 'react';
import { Calendar, User, MoreVertical, Clock, CheckCircle2 } from 'lucide-react';

const TaskCard = ({ task, onEdit, onStatusChange, onDelete }) => {
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'done';

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const priorityLabels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High'
  };

  const handleStatusSelect = (e) => {
    e.stopPropagation();
    onStatusChange(task._id, e.target.value);
  };

  return (
    <div
      className="kanban-task-card"
      onClick={() => onEdit(task)}
      id={`task-card-${task._id}`}
    >
      <div className="task-card-tags">
        <span className={`badge badge-${task.priority}`}>
          {priorityLabels[task.priority] || task.priority}
        </span>
        {task.status === 'done' && (
          <span className="badge badge-status-done" style={{ gap: '0.2rem' }}>
            <CheckCircle2 size={12} /> Done
          </span>
        )}
      </div>

      <h4 className="task-card-title">{task.title}</h4>

      {task.description && (
        <p className="task-card-desc">{task.description}</p>
      )}

      <div className="task-card-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {task.dueDate && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: isOverdue ? 'var(--danger)' : 'var(--text-muted)',
                fontWeight: isOverdue ? 700 : 500
              }}
              title={isOverdue ? 'Overdue!' : 'Due date'}
            >
              <Calendar size={13} />
              {formatDate(task.dueDate)}
            </span>
          )}

          {/* Quick status toggle dropdown */}
          <select
            value={task.status}
            onChange={handleStatusSelect}
            onClick={(e) => e.stopPropagation()}
            style={{
              fontSize: '0.7rem',
              padding: '0.15rem 0.35rem',
              borderRadius: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer'
            }}
            title="Change status"
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {task.assignedTo ? (
            <div
              className="avatar"
              style={{ width: 24, height: 24, fontSize: '0.65rem' }}
              title={`Assigned to ${task.assignedTo.name || task.assignedTo.email}`}
            >
              {getInitials(task.assignedTo.name || task.assignedTo.email)}
            </div>
          ) : (
            <span title="Unassigned" style={{ color: 'var(--text-muted)' }}>
              <User size={14} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
