import React, { useState } from 'react';
import { Plus, MoreHorizontal, Edit2, Trash2, Check, X } from 'lucide-react';
import TaskCard from './TaskCard';

const ListColumn = ({
  list,
  tasks = [],
  onAddTask,
  onEditTask,
  onStatusChange,
  onDeleteTask,
  onUpdateListTitle,
  onDeleteList
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(list.title);
  const [showMenu, setShowMenu] = useState(false);

  const handleSaveTitle = async (e) => {
    e.preventDefault();
    if (!editedTitle.trim()) return;
    await onUpdateListTitle(list._id, editedTitle.trim());
    setIsEditingTitle(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the list "${list.title}" and all its tasks?`)) {
      onDeleteList(list._id);
    }
    setShowMenu(false);
  };

  return (
    <div className="kanban-column" id={`list-column-${list._id}`}>
      <div className="kanban-column-header">
        {isEditingTitle ? (
          <form onSubmit={handleSaveTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="form-input"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
              autoFocus
            />
            <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0.25rem' }}>
              <Check size={14} />
            </button>
            <button
              type="button"
              onClick={() => {
                setEditedTitle(list.title);
                setIsEditingTitle(false);
              }}
              className="btn btn-ghost btn-sm"
              style={{ padding: '0.25rem' }}
            >
              <X size={14} />
            </button>
          </form>
        ) : (
          <div className="column-title-group" style={{ flex: 1 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{list.title}</h3>
            <span className="column-count-badge">{tasks.length}</span>
          </div>
        )}

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="btn btn-ghost btn-icon btn-sm"
            type="button"
            aria-label="List options"
          >
            <MoreHorizontal size={16} />
          </button>

          {showMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: '0.25rem',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.35rem',
                zIndex: 20,
                minWidth: '130px'
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setIsEditingTitle(true);
                  setShowMenu(false);
                }}
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.4rem 0.6rem' }}
              >
                <Edit2 size={13} />
                <span>Rename</span>
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.4rem 0.6rem', color: 'var(--danger)' }}
              >
                <Trash2 size={13} />
                <span>Delete List</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="kanban-task-list">
        {tasks.length === 0 ? (
          <div
            style={{
              padding: '1.5rem 0.75rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.825rem',
              border: '1px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            No tasks in this list
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={onEditTask}
              onStatusChange={onStatusChange}
              onDelete={onDeleteTask}
            />
          ))
        )}
      </div>

      <div style={{ padding: '0.75rem' }}>
        <button
          onClick={() => onAddTask(list._id)}
          className="btn btn-ghost btn-sm"
          style={{ width: '100%', justifyContent: 'center', border: '1px dashed var(--border-subtle)' }}
          type="button"
          id={`btn-add-task-${list._id}`}
        >
          <Plus size={15} />
          <span>Add Task</span>
        </button>
      </div>
    </div>
  );
};

export default ListColumn;
