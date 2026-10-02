import React, { useState, useRef, useEffect } from 'react';
import { Plus, MoreHorizontal, Edit2, Trash2, Check, X, CornerDownLeft } from 'lucide-react';
import TaskCard from './TaskCard';
import ConfirmDialog from './ConfirmDialog';
import { useI18n } from '../i18n';

const ListColumn = ({
  list,
  tasks = [],
  onAddTask,
  onQuickAddTask,
  onEditTask,
  onStatusChange,
  onDeleteTask,
  onUpdateListTitle,
  onDeleteList
}) => {
  const { t, language } = useI18n();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(list.title);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // Quick Task inline creation state
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [isSubmittingQuick, setIsSubmittingQuick] = useState(false);
  const quickInputRef = useRef(null);

  // Delete List Confirmation Dialog
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Pick a subtle status dot color based on list title
  const getListDotColor = (title) => {
    const lower = (title || '').toLowerCase();
    if (lower.includes('done') || lower.includes('مكتمل') || lower.includes('تم')) {
      return 'var(--status-done-dot)';
    }
    if (lower.includes('progress') || lower.includes('تنفيذ') || lower.includes('عمل')) {
      return 'var(--status-inprogress-dot)';
    }
    if (lower.includes('review') || lower.includes('مراجعة') || lower.includes('تدقيق')) {
      return 'var(--status-review-dot)';
    }
    return 'var(--status-todo-dot)';
  };

  const handleSaveTitle = async (e) => {
    e.preventDefault();
    if (!editedTitle.trim()) return;
    await onUpdateListTitle(list._id, editedTitle.trim());
    setIsEditingTitle(false);
  };

  const handleQuickAddSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!quickTitle.trim() || isSubmittingQuick) return;

    try {
      setIsSubmittingQuick(true);
      if (onQuickAddTask) {
        await onQuickAddTask(list._id, quickTitle.trim());
      } else {
        await onAddTask(list._id);
      }
      setQuickTitle('');
      quickInputRef.current?.focus();
    } finally {
      setIsSubmittingQuick(false);
    }
  };

  const handleQuickKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuickAddSubmit();
    } else if (e.key === 'Escape') {
      setIsQuickAdding(false);
      setQuickTitle('');
    }
  };

  return (
    <div className="list-column" id={`list-column-${list._id}`}>
      {/* Column Header */}
      <div className="list-header">
        {isEditingTitle ? (
          <form onSubmit={handleSaveTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="form-control"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.85rem' }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setEditedTitle(list.title);
                  setIsEditingTitle(false);
                }
              }}
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm btn-icon"
              style={{ width: 26, height: 26 }}
              title={t('common.save')}
              aria-label={t('common.save')}
            >
              <Check size={13} />
            </button>
            <button
              type="button"
              onClick={() => {
                setEditedTitle(list.title);
                setIsEditingTitle(false);
              }}
              className="btn btn-ghost btn-sm btn-icon"
              style={{ width: 26, height: 26 }}
              title={t('common.cancel')}
              aria-label={t('common.cancel')}
            >
              <X size={13} />
            </button>
          </form>
        ) : (
          <div className="list-title" style={{ flex: 1 }}>
            <span
              className="list-status-dot"
              style={{ backgroundColor: getListDotColor(list.title) }}
            />
            <span>{list.title}</span>
            <span className="list-count-badge">{tasks.length}</span>
          </div>
        )}

        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="btn btn-ghost btn-icon btn-sm"
            type="button"
            aria-label="List options"
            style={{ width: 26, height: 26, color: 'var(--color-text-muted)' }}
          >
            <MoreHorizontal size={15} />
          </button>

          {showMenu && (
            <div
              style={{
                position: 'absolute',
                insetInlineEnd: 0,
                top: '100%',
                marginTop: '0.25rem',
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border-medium)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-modal)',
                padding: '0.35rem',
                zIndex: 30,
                minWidth: '150px'
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
                <span>{t('board.renameList')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  setShowDeleteConfirm(true);
                }}
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.4rem 0.6rem', color: 'var(--color-danger)' }}
              >
                <Trash2 size={13} />
                <span>{t('board.deleteList')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cards List */}
      <div className="list-cards">
        {tasks.length === 0 && !isQuickAdding ? (
          <div
            style={{
              padding: '1.5rem 0.75rem',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              fontSize: '0.8rem',
              border: '1px dashed var(--color-border-subtle)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            {t('board.emptyList')}
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

        {/* Inline Quick Add Task Box */}
        {isQuickAdding && (
          <form onSubmit={handleQuickAddSubmit} className="quick-task-form">
            <textarea
              ref={quickInputRef}
              className="quick-task-textarea"
              placeholder={t('common.quickAddPlaceholder')}
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              onKeyDown={handleQuickKeyDown}
              autoFocus
              rows={2}
            />
            <div className="quick-task-actions">
              <button
                type="button"
                onClick={() => {
                  setIsQuickAdding(false);
                  setQuickTitle('');
                }}
                className="btn btn-ghost btn-sm"
                disabled={isSubmittingQuick}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={!quickTitle.trim() || isSubmittingQuick}
              >
                <span>{isSubmittingQuick ? t('common.creating') : t('common.create')}</span>
                <CornerDownLeft size={12} />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Column Footer */}
      <div className="list-footer" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <button
          onClick={() => {
            setIsQuickAdding(true);
            setTimeout(() => quickInputRef.current?.focus(), 50);
          }}
          className="btn btn-ghost btn-sm"
          style={{ flex: 1, justifyContent: 'flex-start', color: 'var(--color-text-secondary)', fontSize: '0.825rem' }}
          type="button"
          id={`btn-quick-add-${list._id}`}
        >
          <Plus size={15} />
          <span>{t('board.addTask')}</span>
        </button>

        <button
          onClick={() => onAddTask(list._id)}
          className="btn btn-ghost btn-sm btn-icon"
          title={language === 'ar' ? 'خيارات وتفاصيل إضافية للمهمة' : 'More task details'}
          type="button"
          style={{ width: 26, height: 26, color: 'var(--color-text-muted)' }}
        >
          <Edit2 size={13} />
        </button>
      </div>

      {/* Custom Delete List Confirm Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          onDeleteList(list._id);
          setShowDeleteConfirm(false);
        }}
        title={t('board.deleteList')}
        message={t('board.deleteListConfirm')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        isDanger={true}
      />
    </div>
  );
};

export default ListColumn;
