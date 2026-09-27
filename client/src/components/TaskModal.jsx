import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Alert from './Alert';
import { Trash2 } from 'lucide-react';

const TaskModal = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  task = null, // null for new task, object for editing
  boardMembers = [],
  lists = [],
  defaultListId = null
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedListId, setSelectedListId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'todo');
      setPriority(task.priority || 'medium');
      setAssignedTo(task.assignedTo?._id || task.assignedTo || '');
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
      setSelectedListId(task.list?._id || task.list || defaultListId || '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setAssignedTo('');
      setDueDate('');
      setSelectedListId(defaultListId || (lists[0] ? lists[0]._id : ''));
    }
    setError('');
  }, [task, defaultListId, isOpen, lists]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const taskData = {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assignedTo: assignedTo || null,
        dueDate: dueDate || null,
        list: selectedListId
      };

      await onSave(taskData, task?._id, selectedListId);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!task?._id) return;
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        setIsSubmitting(true);
        await onDelete(task._id);
        onClose();
      } catch (err) {
        setError(err.message || 'Failed to delete task');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Create New Task'}
      maxWidth="560px"
    >
      <form onSubmit={handleSubmit}>
        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

        <div className="form-group">
          <label className="form-label" htmlFor="task-title">Title *</label>
          <input
            id="task-title"
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Implement user authentication"
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="task-desc">Description</label>
          <textarea
            id="task-desc"
            className="form-textarea"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add detailed task notes or checklist..."
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="task-status">Status</label>
            <select
              id="task-status"
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-priority">Priority</label>
            <select
              id="task-priority"
              className="form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="task-assigned">Assigned Member</label>
            <select
              id="task-assigned"
              className="form-select"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">Unassigned</option>
              {boardMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name || member.email}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-duedate">Due Date</label>
            <input
              id="task-duedate"
              type="date"
              className="form-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {task && lists.length > 1 && (
          <div className="form-group">
            <label className="form-label" htmlFor="task-list">Move to List</label>
            <select
              id="task-list"
              className="form-select"
              value={selectedListId}
              onChange={(e) => setSelectedListId(e.target.value)}
            >
              {lists.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: task ? 'space-between' : 'flex-end',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)'
          }}
        >
          {task && (
            <button
              type="button"
              onClick={handleDelete}
              className="btn btn-danger btn-sm"
              disabled={isSubmitting}
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
          )}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal;
