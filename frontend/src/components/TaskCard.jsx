import React from 'react';
import { Calendar, User, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { useI18n } from '../i18n';

const TaskCard = ({ task, onEdit, onStatusChange, onDelete }) => {
  const { t, language } = useI18n();

  const isDone = task.status === 'done';

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    !isDone;

  const isDueToday =
    task.dueDate &&
    !isDone &&
    new Date(task.dueDate).toDateString() === new Date().toDateString();

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      month: 'short',
      day: 'numeric'
    });
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

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'low': return t('task.priorityLow');
      case 'medium': return t('task.priorityMedium');
      case 'high': return t('task.priorityHigh');
      default: return priority;
    }
  };

  const getPriorityDotColor = (priority) => {
    switch (priority) {
      case 'low': return 'var(--color-success)';
      case 'medium': return 'var(--color-primary)';
      case 'high': return 'var(--color-warning)';
      default: return 'var(--color-text-muted)';
    }
  };

  const toggleDoneQuick = (e) => {
    e.stopPropagation();
    onStatusChange(task._id, isDone ? 'todo' : 'done');
  };

  const handleStatusSelect = (e) => {
    e.stopPropagation();
    onStatusChange(task._id, e.target.value);
  };

  return (
    <div
      className={`task-card ${isDone ? 'is-done' : ''}`}
      onClick={() => onEdit(task)}
      id={`task-card-${task._id}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onEdit(task);
      }}
    >
      {/* Top Meta: Priority Pill + Checkbox */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.725rem',
            fontWeight: 600,
            padding: '0.15rem 0.5rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border-subtle)',
            color: 'var(--color-text-secondary)'
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: getPriorityDotColor(task.priority)
            }}
          />
          <span>{getPriorityLabel(task.priority)}</span>
        </div>

        {/* Quick Done Checkbox */}
        <button
          type="button"
          onClick={toggleDoneQuick}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            color: isDone ? 'var(--color-success)' : 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color var(--transition-fast)'
          }}
          title={isDone ? (language === 'ar' ? 'تعيين كغير مكتملة' : 'Mark incomplete') : (language === 'ar' ? 'تعيين كمكتملة' : 'Mark as done')}
          aria-label={isDone ? 'Mark incomplete' : 'Mark as done'}
        >
          {isDone ? <CheckCircle2 size={16} /> : <Circle size={16} />}
        </button>
      </div>

      {/* Task Title */}
      <h4 className="task-card-title">{task.title}</h4>

      {/* Task Description */}
      {task.description && (
        <p className="task-card-desc">{task.description}</p>
      )}

      {/* Bottom Meta: Due Date & Assignee */}
      <div className="task-card-meta">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {task.dueDate && (
            <span
              className={`date-pill ${isOverdue ? 'overdue' : isDueToday ? 'due-today' : 'normal'}`}
              title={isOverdue ? t('task.overdue') : isDueToday ? t('task.dueToday') : t('task.dueDateLabel')}
            >
              {isOverdue ? <AlertCircle size={12} /> : <Calendar size={12} />}
              <span>{formatDate(task.dueDate)}</span>
            </span>
          )}

          {/* Quick status dropdown */}
          <select
            value={task.status || 'todo'}
            onChange={handleStatusSelect}
            onClick={(e) => e.stopPropagation()}
            style={{
              fontSize: '0.725rem',
              padding: '0.15rem 0.4rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border-subtle)',
              backgroundColor: 'var(--color-bg-subtle)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              outline: 'none'
            }}
            title={t('task.statusLabel')}
            aria-label={t('task.statusLabel')}
          >
            <option value="todo">{t('task.statusTodo')}</option>
            <option value="in_progress">{t('task.statusInProgress')}</option>
            <option value="done">{t('task.statusDone')}</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {task.assignedTo ? (
            <div
              className="avatar"
              style={{ width: 22, height: 22, fontSize: '0.625rem' }}
              title={`${t('task.assignedTo')} ${task.assignedTo.name || task.assignedTo.email}`}
            >
              {getInitials(task.assignedTo.name || task.assignedTo.email)}
            </div>
          ) : (
            <span title={t('task.unassigned')} style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
              <User size={13} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
