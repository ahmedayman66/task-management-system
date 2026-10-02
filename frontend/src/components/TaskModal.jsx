import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Alert from './Alert';
import ConfirmDialog from './ConfirmDialog';
import CustomSelect from './CustomSelect';
import { Trash2 } from 'lucide-react';
import { useI18n } from '../i18n';

const TaskModal = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  task = null,
  boardMembers = [],
  lists = [],
  defaultListId = null
}) => {
  const { t } = useI18n();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedListId, setSelectedListId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
      setError(t('errors.taskTitleRequired'));
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
      setError(err.message || t('errors.generic'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!task?._id) return;
    try {
      setIsSubmitting(true);
      setShowDeleteConfirm(false);
      await onDelete(task._id);
      onClose();
    } catch (err) {
      setError(err.message || t('errors.generic'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? t('task.editTitle') : t('task.createTitle')}
      maxWidth="580px"
    >
      <form onSubmit={handleSubmit} id="task-form">
        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

        <div className="form-group">
          <label className="form-label" htmlFor="task-title">
            {t('task.titleLabel')}
          </label>
          <input
            id="task-title"
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('task.titlePlaceholder')}
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="task-desc">
            {t('task.descriptionLabel')}
          </label>
          <textarea
            id="task-desc"
            className="form-control form-textarea"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('task.descriptionPlaceholder')}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="task-status">
              {t('task.statusLabel')}
            </label>
            <CustomSelect
              fullWidth
              value={status}
              onChange={setStatus}
              options={[
                { value: 'todo', label: t('task.statusTodo') },
                { value: 'in_progress', label: t('task.statusInProgress') },
                { value: 'done', label: t('task.statusDone') }
              ]}
              ariaLabel={t('task.statusLabel')}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-priority">
              {t('task.priorityLabel')}
            </label>
            <CustomSelect
              fullWidth
              value={priority}
              onChange={setPriority}
              options={[
                { value: 'low', label: t('task.priorityLow') },
                { value: 'medium', label: t('task.priorityMedium') },
                { value: 'high', label: t('task.priorityHigh') }
              ]}
              ariaLabel={t('task.priorityLabel')}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="task-assigned">
              {t('task.assigneeLabel')}
            </label>
            <CustomSelect
              fullWidth
              value={assignedTo}
              onChange={setAssignedTo}
              options={[
                { value: '', label: t('task.unassigned') },
                ...boardMembers.map((member) => ({
                  value: member._id,
                  label: member.name || member.email
                }))
              ]}
              ariaLabel={t('task.assigneeLabel')}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-duedate">
              {t('task.dueDateLabel')}
            </label>
            <input
              id="task-duedate"
              type="date"
              className="form-control"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {task && lists.length > 1 && (
          <div className="form-group">
            <label className="form-label" htmlFor="task-list">
              {t('task.listLabel')}
            </label>
            <CustomSelect
              fullWidth
              value={selectedListId}
              onChange={setSelectedListId}
              options={lists.map((l) => ({
                value: l._id,
                label: l.title
              }))}
              ariaLabel={t('task.listLabel')}
            />
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: task ? 'space-between' : 'flex-end',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--color-border-subtle)',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}
        >
          {task && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="btn btn-danger btn-sm"
              disabled={isSubmitting}
            >
              <Trash2 size={15} />
              <span>{t('task.deleteBtn')}</span>
            </button>
          )}

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              id="btn-save-task"
            >
              {isSubmitting
                ? t('common.saving')
                : task
                ? t('task.saveBtn')
                : t('task.createBtn')}
            </button>
          </div>
        </div>
      </form>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title={t('task.deleteConfirm')}
        message={t('task.deleteConfirm')}
        confirmText={t('task.deleteBtn')}
        cancelText={t('common.cancel')}
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </Modal>
  );
};

export default TaskModal;
