import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import { useToast } from '../context/ToastContext';
import { boardApi } from '../api/boardApi';
import { listApi } from '../api/listApi';
import { taskApi } from '../api/taskApi';
import Navbar from '../components/Navbar';
import ListColumn from '../components/ListColumn';
import TaskModal from '../components/TaskModal';
import BoardMembersModal from '../components/BoardMembersModal';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import CustomSelect from '../components/CustomSelect';
import {
  Plus,
  Users,
  Search,
  Settings,
  Kanban,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
  ChevronLeft,
  UserPlus,
  FolderKanban,
  ShieldCheck,
  Clock,
  Layers,
  Circle,
  RotateCcw
} from 'lucide-react';

const BoardView = () => {
  const { boardId } = useParams();
  const { user } = useAuth();
  const { t, isRTL, language } = useI18n();
  const toast = useToast();
  const navigate = useNavigate();

  // Core Data State
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [targetListId, setTargetListId] = useState(null);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isAddListModalOpen, setIsAddListModalOpen] = useState(false);
  const [isBoardSettingsOpen, setIsBoardSettingsOpen] = useState(false);

  // Forms State
  const [newListTitle, setNewListTitle] = useState('');
  const [editBoardTitle, setEditBoardTitle] = useState('');
  const [editBoardDescription, setEditBoardDescription] = useState('');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');

  // Fetch full board data
  const loadBoardData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [boardRes, listsRes, tasksRes] = await Promise.all([
        boardApi.getBoardById(boardId),
        listApi.getListsByBoard(boardId),
        taskApi.getTasks({ boardId, limit: 100 })
      ]);

      if (boardRes.success && boardRes.data?.board) {
        setBoard(boardRes.data.board);
        setEditBoardTitle(boardRes.data.board.title);
        setEditBoardDescription(boardRes.data.board.description || '');
      }

      if (listsRes.success && listsRes.data?.lists) {
        setLists(listsRes.data.lists);
      }

      if (tasksRes.success && tasksRes.data) {
        const taskArray = Array.isArray(tasksRes.data)
          ? tasksRes.data
          : tasksRes.data.tasks || [];
        setTasks(taskArray);
      }
    } catch (err) {
      setError(err.message || t('errors.generic'));
      toast.error(err.message || t('errors.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (boardId) {
      loadBoardData();
    }
  }, [boardId]);

  // Board Completion Metrics
  const metrics = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const todo = tasks.filter((t) => !t.status || t.status === 'todo').length;
    const overdue = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
    ).length;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, inProgress, todo, overdue, percent };
  }, [tasks]);

  // Filter tasks based on search and filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = (task.description || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      if (statusFilter && task.status !== statusFilter) return false;
      if (priorityFilter && task.priority !== priorityFilter) return false;

      if (assigneeFilter) {
        if (assigneeFilter === 'unassigned') {
          if (task.assignedTo) return false;
        } else {
          const assignedId = task.assignedTo?._id || task.assignedTo;
          if (assignedId?.toString() !== assigneeFilter) return false;
        }
      }

      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, assigneeFilter]);

  // Group tasks by list ID
  const tasksByList = useMemo(() => {
    const map = {};
    lists.forEach((list) => {
      map[list._id] = [];
    });
    filteredTasks.forEach((task) => {
      const listId = task.list?._id || task.list;
      if (map[listId]) {
        map[listId].push(task);
      }
    });
    return map;
  }, [lists, filteredTasks]);

  // --- List Handlers ---
  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    try {
      const res = await listApi.createList(boardId, { title: newListTitle.trim() });
      if (res.success && res.data?.list) {
        setLists([...lists, res.data.list]);
        setNewListTitle('');
        setIsAddListModalOpen(false);
        toast.success(t('board.listCreated'));
      }
    } catch (err) {
      toast.error(err.message || t('errors.generic'));
    }
  };

  const handleUpdateListTitle = async (listId, title) => {
    try {
      const res = await listApi.updateList(listId, { title });
      if (res.success && res.data?.list) {
        setLists(lists.map((l) => (l._id === listId ? res.data.list : l)));
        toast.success(t('board.listUpdated'));
      }
    } catch (err) {
      toast.error(err.message || t('errors.generic'));
    }
  };

  const handleDeleteList = async (listId) => {
    try {
      await listApi.deleteList(listId);
      setLists(lists.filter((l) => l._id !== listId));
      setTasks(tasks.filter((t) => (t.list?._id || t.list) !== listId));
      toast.success(t('board.listDeleted'));
    } catch (err) {
      toast.error(err.message || t('errors.generic'));
    }
  };

  // --- Task Handlers ---
  const handleOpenAddTask = (listId) => {
    setEditingTask(null);
    setTargetListId(listId);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task) => {
    setEditingTask(task);
    setTargetListId(task.list?._id || task.list);
    setIsTaskModalOpen(true);
  };

  const handleQuickAddTask = async (listId, taskTitle) => {
    try {
      const res = await taskApi.createTask(listId, {
        title: taskTitle,
        status: 'todo',
        priority: 'medium'
      });
      if (res.success && res.data?.task) {
        setTasks((prev) => [...prev, res.data.task]);
        toast.success(t('task.taskCreated'));
      }
    } catch (err) {
      toast.error(err.message || t('errors.generic'));
    }
  };

  const handleSaveTask = async (taskData, taskId, currentListId) => {
    try {
      if (taskId) {
        const res = await taskApi.updateTask(taskId, taskData);
        if (res.success && res.data?.task) {
          setTasks(tasks.map((t) => (t._id === taskId ? res.data.task : t)));
          toast.success(t('task.taskUpdated'));
        }
      } else {
        const res = await taskApi.createTask(currentListId, taskData);
        if (res.success && res.data?.task) {
          setTasks([...tasks, res.data.task]);
          toast.success(t('task.taskCreated'));
        }
      }
    } catch (err) {
      toast.error(err.message || t('errors.generic'));
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await taskApi.updateTaskStatus(taskId, newStatus);
      if (res.success && res.data?.task) {
        setTasks(tasks.map((t) => (t._id === taskId ? res.data.task : t)));
      }
    } catch (err) {
      toast.error(err.message || t('errors.generic'));
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskApi.deleteTask(taskId);
      setTasks(tasks.filter((t) => t._id !== taskId));
      toast.success(t('task.taskDeleted'));
    } catch (err) {
      toast.error(err.message || t('errors.generic'));
    }
  };

  // --- Board Settings & Member Handlers ---
  const handleSaveBoardSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await boardApi.updateBoard(boardId, {
        title: editBoardTitle.trim(),
        description: editBoardDescription.trim()
      });
      if (res.success && res.data?.board) {
        setBoard(res.data.board);
        setIsBoardSettingsOpen(false);
        toast.success(t('board.boardUpdated'));
      }
    } catch (err) {
      toast.error(err.message || t('errors.generic'));
    }
  };

  const handleAddMember = async (bId, data) => {
    try {
      const res = await boardApi.addMember(bId, data);
      if (res.success && res.data?.board) {
        setBoard(res.data.board);
      }
      return res;
    } catch (err) {
      toast.error(err.message || t('errors.generic'));
      throw err;
    }
  };

  const handleRemoveMember = async (bId, userId) => {
    try {
      const res = await boardApi.removeMember(bId, userId);
      if (res.success && res.data?.board) {
        setBoard(res.data.board);
        const refreshedTasks = await taskApi.getTasks({ boardId, limit: 100 });
        if (refreshedTasks.success && refreshedTasks.data) {
          const taskArray = Array.isArray(refreshedTasks.data)
            ? refreshedTasks.data
            : refreshedTasks.data.tasks || [];
          setTasks(taskArray);
        }
      }
      return res;
    } catch (err) {
      toast.error(err.message || t('errors.generic'));
      throw err;
    }
  };

  const isOwner =
    (board?.owner?._id || board?.owner) === user?._id;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="app-container">
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner size="large" message={t('common.loading')} />
        </div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="app-container">
        <Navbar />
        <div style={{ maxWidth: 540, margin: '4rem auto', padding: '0 1rem' }}>
          <Alert type="danger" message={error || t('board.notFound')} />
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
            style={{ marginTop: '1rem' }}
          >
            {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            <span>{t('board.backToDashboard')}</span>
          </button>
        </div>
      </div>
    );
  }

  const members = board.members || [];

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content" style={{ maxWidth: 1440, padding: '1.75rem 1.5rem 3.5rem' }}>
        {/* Top Breadcrumbs */}
        <div className="breadcrumb-bar" style={{ marginBottom: '1.25rem' }}>
          <Link to="/dashboard" className="breadcrumb-link">
            {t('nav.dashboard')}
          </Link>
          {isRTL ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
          <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            {board.title}
          </span>
        </div>

        {/* Welcome Board Hero Banner (Matches Dashboard) */}
        <div className="dashboard-hero">
          <div style={{ flex: '1 1 520px', minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
              <div className="dashboard-hero-badge">
                {isOwner ? <ShieldCheck size={14} /> : <Users size={14} />}
                <span>{isOwner ? t('dashboard.ownedBadge') : t('dashboard.memberBadge')}</span>
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  backgroundColor: 'var(--color-bg-subtle)',
                  padding: '0.2rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-border-subtle)'
                }}
              >
                {t('board.listsCount', { count: lists.length })} • {t('board.tasksCount', { count: tasks.length })}
              </span>
            </div>

            <div>
              <h1 className="dashboard-hero-title" style={{ margin: 0 }}>
                {board.title}
              </h1>
            </div>

            <p className="dashboard-hero-subtitle" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
              {board.description || (language === 'ar' ? 'لا يوجد وصف مضاف لهذا المشروع بعد.' : 'No description added for this project yet.')}
            </p>

            {/* Completion Progress Bar */}
            {metrics.total > 0 && (
              <div className="board-progress-wrapper">
                <div className="board-progress-header">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={13} style={{ color: 'var(--color-success)' }} />
                    <span>{metrics.done}/{metrics.total} {t('common.completed')}</span>
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{metrics.percent}%</span>
                </div>
                <div className="board-progress-track">
                  <div
                    className="board-progress-fill"
                    style={{ width: `${metrics.percent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick CTAs on Hero Banner */}
          <div className="dashboard-hero-cta">
            <button
              onClick={() => setIsAddListModalOpen(true)}
              className="btn-hero-primary"
              id="btn-add-list-hero"
              type="button"
            >
              <Plus size={19} />
              <span>{t('board.addList')}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMembersModalOpen(true)}
              className="btn btn-secondary"
              style={{ padding: '0.65rem 1rem', height: '44px' }}
              title={t('board.membersBtn', { count: members.length })}
            >
              <div className="avatar-stack" style={{ marginInlineEnd: '0.35rem' }}>
                {members.slice(0, 3).map((m, idx) => (
                  <div
                    key={m._id || idx}
                    className="avatar"
                    style={{ width: 24, height: 24, fontSize: '0.625rem' }}
                    title={m.name || m.email}
                  >
                    {getInitials(m.name || m.email)}
                  </div>
                ))}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {t('board.membersBtn', { count: members.length })}
              </span>
              <UserPlus size={15} style={{ color: 'var(--color-text-muted)' }} />
            </button>

            {isOwner && (
              <button
                type="button"
                onClick={() => setIsBoardSettingsOpen(true)}
                className="btn btn-secondary btn-icon"
                style={{ width: 44, height: 44 }}
                title={t('board.editBoard')}
              >
                <Settings size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Quick Metrics / Stats Cards Grid (Matches Dashboard) */}
        <div className="dashboard-stats-grid">
          <div className="stat-card">
            <div className="stat-card-top">
              <div className="stat-card-icon-box stat-card-icon-blue">
                <FolderKanban size={22} />
              </div>
              <span className="stat-card-tag">{t('board.tasksCount', { count: metrics.total })}</span>
            </div>
            <div>
              <div className="stat-card-label">{language === 'ar' ? 'إجمالي المهام' : 'Total Tasks'}</div>
              <div className="stat-card-value">{metrics.total}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <div className="stat-card-icon-box stat-card-icon-emerald">
                <CheckCircle2 size={22} />
              </div>
              <span className="stat-card-tag">{metrics.percent}% {t('common.progress')}</span>
            </div>
            <div>
              <div className="stat-card-label">{t('common.completed')}</div>
              <div className="stat-card-value">{metrics.done}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <div className="stat-card-icon-box stat-card-icon-amber">
                <Clock size={22} />
              </div>
              <span className="stat-card-tag">{t('task.statusInProgress')}</span>
            </div>
            <div>
              <div className="stat-card-label">{language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</div>
              <div className="stat-card-value">{metrics.inProgress}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <div className="stat-card-icon-box stat-card-icon-purple">
                <Users size={22} />
              </div>
              <span className="stat-card-tag">{language === 'ar' ? 'فريق العمل' : 'Team'}</span>
            </div>
            <div>
              <div className="stat-card-label">{t('common.members')}</div>
              <div className="stat-card-value">{members.length}</div>
            </div>
          </div>
        </div>

        {/* Workspace Filter & Action Toolbar (Matches Dashboard) */}
        <div className="workspace-toolbar">
          {/* Status Tabs */}
          <div className="workspace-tabs" role="tablist">
            <button
              type="button"
              className={`workspace-tab ${statusFilter === '' ? 'active' : ''}`}
              onClick={() => setStatusFilter('')}
            >
              <Layers size={15} />
              <span>{t('board.allStatuses')}</span>
              <span className="workspace-tab-count">{metrics.total}</span>
            </button>

            <button
              type="button"
              className={`workspace-tab ${statusFilter === 'todo' ? 'active' : ''}`}
              onClick={() => setStatusFilter(statusFilter === 'todo' ? '' : 'todo')}
            >
              <Circle size={13} style={{ color: 'var(--status-todo-dot)' }} />
              <span>{t('task.statusTodo')}</span>
              <span className="workspace-tab-count">{metrics.todo}</span>
            </button>

            <button
              type="button"
              className={`workspace-tab ${statusFilter === 'in_progress' ? 'active' : ''}`}
              onClick={() => setStatusFilter(statusFilter === 'in_progress' ? '' : 'in_progress')}
            >
              <Clock size={13} style={{ color: 'var(--status-inprogress-dot)' }} />
              <span>{t('task.statusInProgress')}</span>
              <span className="workspace-tab-count">{metrics.inProgress}</span>
            </button>

            <button
              type="button"
              className={`workspace-tab ${statusFilter === 'done' ? 'active' : ''}`}
              onClick={() => setStatusFilter(statusFilter === 'done' ? '' : 'done')}
            >
              <CheckCircle2 size={13} style={{ color: 'var(--status-done-dot)' }} />
              <span>{t('task.statusDone')}</span>
              <span className="workspace-tab-count">{metrics.done}</span>
            </button>
          </div>

          {/* Search & Select Filters */}
          <div className="workspace-actions">
            <div className="search-box-wrapper">
              <Search size={15} className="search-icon-inside" />
              <input
                type="text"
                className="search-input"
                placeholder={t('board.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="search-clear-btn"
                  title="Clear"
                >
                  <X size={14} />
                </button>
              ) : (
                <span
                  style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    insetInlineEnd: '0.65rem',
                    fontSize: '0.675rem',
                    color: 'var(--color-text-muted)',
                    backgroundColor: 'var(--color-bg-subtle)',
                    padding: '0.1rem 0.35rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--color-border-subtle)',
                    pointerEvents: 'none'
                  }}
                >
                  /
                </span>
              )}
            </div>

            <CustomSelect
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={[
                { value: '', label: t('board.allPriorities') },
                { value: 'low', label: t('task.priorityLow') },
                { value: 'medium', label: t('task.priorityMedium') },
                { value: 'high', label: t('task.priorityHigh') }
              ]}
              ariaLabel={t('board.filterByPriority')}
            />

            <CustomSelect
              value={assigneeFilter}
              onChange={setAssigneeFilter}
              options={[
                { value: '', label: t('board.allAssignees') },
                { value: 'unassigned', label: t('task.unassigned') },
                ...members.map((m) => ({
                  value: m._id,
                  label: m.name || m.email
                }))
              ]}
              ariaLabel={t('board.filterByAssignee')}
            />

            {(searchQuery || statusFilter || priorityFilter || assigneeFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                  setPriorityFilter('');
                  setAssigneeFilter('');
                }}
                className="btn-clear-filters"
                title={t('board.clearAll')}
                aria-label={t('board.clearAll')}
              >
                <RotateCcw size={13} className="clear-filters-icon" />
                <span>{t('board.clearAll')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Kanban Board Section */}
        <div style={{ marginTop: '0.75rem' }}>
          <div className="board-section-header">
            <div className="board-section-title">
              <Kanban size={20} style={{ color: 'var(--color-primary)' }} />
              <span>{language === 'ar' ? 'سير العمل وقوائم المهام' : 'Workflow & Task Lists'}</span>
              <span className="board-section-badge">
                {lists.length} {language === 'ar' ? 'قوائم' : 'lists'}
              </span>
            </div>
          </div>

          <div className="kanban-board-container">
            <div className="kanban-board">
              {lists.length === 0 ? (
                <div style={{ width: '100%', maxWidth: '480px', margin: '2rem auto' }}>
                  <EmptyState
                    icon={Kanban}
                    title={t('empty.noBoards')}
                    description={t('empty.createBoardPrompt')}
                    action={
                      <button
                        onClick={() => setIsAddListModalOpen(true)}
                        className="btn btn-primary"
                      >
                        <Plus size={16} />
                        <span>{t('board.createListBtn')}</span>
                      </button>
                    }
                  />
                </div>
              ) : (
                <>
                  {lists.map((list) => (
                    <ListColumn
                      key={list._id}
                      list={list}
                      tasks={tasksByList[list._id] || []}
                      onAddTask={handleOpenAddTask}
                      onQuickAddTask={handleQuickAddTask}
                      onEditTask={handleOpenEditTask}
                      onStatusChange={handleStatusChange}
                      onDeleteTask={handleDeleteTask}
                      onUpdateListTitle={handleUpdateListTitle}
                      onDeleteList={handleDeleteList}
                    />
                  ))}

                  {/* Sleek Ghost Column for adding new list */}
                  <div
                    className="list-column-ghost"
                    onClick={() => setIsAddListModalOpen(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setIsAddListModalOpen(true);
                    }}
                  >
                    <div className="list-column-ghost-icon">
                      <Plus size={20} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.925rem' }}>
                      {t('board.addList')}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {language === 'ar' ? 'أنشئ مرحلة جديدة في سير العمل' : 'Add another workflow stage'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Task Modal (Create & Edit) */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        task={editingTask}
        boardMembers={board.members || []}
        lists={lists}
        defaultListId={targetListId}
      />

      {/* Board Members Modal */}
      <BoardMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        board={board}
        onAddMember={handleAddMember}
        onRemoveMember={handleRemoveMember}
      />

      {/* Add List Modal */}
      <Modal
        isOpen={isAddListModalOpen}
        onClose={() => setIsAddListModalOpen(false)}
        title={t('board.addList')}
        maxWidth="420px"
      >
        <form onSubmit={handleCreateList} id="add-list-form">
          <div className="form-group">
            <label className="form-label" htmlFor="new-list-title">
              {t('board.listTitlePlaceholder')}
            </label>
            <input
              id="new-list-title"
              type="text"
              className="form-control"
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              placeholder={t('board.listTitlePlaceholder')}
              required
              autoFocus
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0', borderTop: 'none', background: 'transparent' }}>
            <button
              type="button"
              onClick={() => setIsAddListModalOpen(false)}
              className="btn btn-secondary"
            >
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary" id="btn-save-list">
              {t('board.createListBtn')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Board Settings Modal */}
      <Modal
        isOpen={isBoardSettingsOpen}
        onClose={() => setIsBoardSettingsOpen(false)}
        title={t('board.editBoard')}
        maxWidth="480px"
      >
        <form onSubmit={handleSaveBoardSettings} id="board-settings-form">
          <div className="form-group">
            <label className="form-label" htmlFor="edit-board-title">
              {t('board.boardTitleLabel')}
            </label>
            <input
              id="edit-board-title"
              type="text"
              className="form-control"
              value={editBoardTitle}
              onChange={(e) => setEditBoardTitle(e.target.value)}
              placeholder={t('board.boardTitlePlaceholder')}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-board-desc">
              {t('board.boardDescLabel')}
            </label>
            <textarea
              id="edit-board-desc"
              className="form-control form-textarea"
              rows="3"
              value={editBoardDescription}
              onChange={(e) => setEditBoardDescription(e.target.value)}
              placeholder={t('board.boardDescPlaceholder')}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0', borderTop: 'none', background: 'transparent' }}>
            <button
              type="button"
              onClick={() => setIsBoardSettingsOpen(false)}
              className="btn btn-secondary"
            >
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary">
              {t('common.save')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BoardView;
