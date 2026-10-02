import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import { useToast } from '../context/ToastContext';
import { boardApi } from '../api/boardApi';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import CustomSelect from '../components/CustomSelect';
import {
  Plus,
  Kanban,
  Users,
  Trash2,
  ArrowUpRight,
  ArrowUpLeft,
  Search,
  ShieldCheck,
  FolderKanban,
  X,
  Clock,
  Sparkles,
  Star,
  LayoutGrid,
  List as ListIcon,
  Layers,
  Crown,
  UserCheck
} from 'lucide-react';

const BANNER_GRADIENTS = [
  { id: 'blue', bg: 'linear-gradient(135deg, #1e3a8a, #0284c7)', iconBg: '#0284c7' },
  { id: 'purple', bg: 'linear-gradient(135deg, #4c1d95, #6366f1)', iconBg: '#6366f1' },
  { id: 'emerald', bg: 'linear-gradient(135deg, #064e3b, #0d9488)', iconBg: '#0d9488' },
  { id: 'amber', bg: 'linear-gradient(135deg, #b45309, #f59e0b)', iconBg: '#f59e0b' },
  { id: 'rose', bg: 'linear-gradient(135deg, #881337, #f43f5e)', iconBg: '#f43f5e' },
  { id: 'slate', bg: 'linear-gradient(135deg, #0f172a, #3b82f6)', iconBg: '#3b82f6' }
];

const getBoardGradient = (boardId = '', title = '') => {
  let hash = 0;
  const str = boardId + title;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % BANNER_GRADIENTS.length;
  return BANNER_GRADIENTS[index];
};

const Dashboard = () => {
  const { user } = useAuth();
  const { t, isRTL, language } = useI18n();
  const toast = useToast();
  const navigate = useNavigate();

  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // SaaS Workspace Controls
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'owned' | 'shared' | 'starred'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'name'
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('taskflow_view_mode') || 'grid';
  });

  // Starred / Favorite Boards in LocalStorage
  const [starredIds, setStarredIds] = useState(() => {
    try {
      const saved = localStorage.getItem('taskflow_starred_boards');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Delete Board Dialog State
  const [boardToDelete, setBoardToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // New Board Form State
  const [boardTitle, setBoardTitle] = useState('');
  const [boardDescription, setBoardDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const fetchBoards = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await boardApi.getBoards();
      if (res.success && res.data) {
        setBoards(res.data.boards || []);
      }
    } catch (err) {
      setError(err.message || t('errors.generic'));
      toast.error(err.message || t('errors.generic'));
    } finally {
      setIsLoading(false);
    }
  }, [t, toast]);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleToggleStar = (boardId, e) => {
    e.stopPropagation();
    setStarredIds((prev) => {
      const next = prev.includes(boardId)
        ? prev.filter((id) => id !== boardId)
        : [...prev, boardId];
      try {
        localStorage.setItem('taskflow_starred_boards', JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });
  };

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('taskflow_view_mode', mode);
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!boardTitle.trim()) {
      setCreateError(t('errors.boardTitleRequired'));
      return;
    }

    try {
      setIsCreating(true);
      setCreateError('');
      const res = await boardApi.createBoard({
        title: boardTitle.trim(),
        description: boardDescription.trim()
      });

      if (res.success && res.data?.board) {
        setBoards([res.data.board, ...boards]);
        setBoardTitle('');
        setBoardDescription('');
        setIsModalOpen(false);
        toast.success(t('dashboard.boardCreated'));
        navigate(`/boards/${res.data.board._id}`);
      }
    } catch (err) {
      setCreateError(err.message || t('errors.generic'));
      toast.error(err.message || t('errors.generic'));
    } finally {
      setIsCreating(false);
    }
  };

  const confirmDeleteBoard = async () => {
    if (!boardToDelete) return;
    try {
      setIsDeleting(true);
      await boardApi.deleteBoard(boardToDelete._id);
      setBoards((prev) => prev.filter((b) => b._id !== boardToDelete._id));
      toast.success(t('dashboard.boardDeleted'));
      setBoardToDelete(null);
    } catch (err) {
      toast.error(err.message || t('errors.generic'));
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      if (diffInMinutes < 5) return language === 'ar' ? 'منذ قليل' : 'Just now';
      if (diffInMinutes < 60) return language === 'ar' ? `منذ ${diffInMinutes} دقيقة` : `${diffInMinutes}m ago`;
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return language === 'ar' ? `منذ ${diffInHours} ساعة` : `${diffInHours}h ago`;
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 30) return language === 'ar' ? `منذ ${diffInDays} يوم` : `${diffInDays}d ago`;
      return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  // Calculated Stats
  const ownedCount = useMemo(
    () => boards.filter((b) => (b.owner?._id || b.owner) === user?._id).length,
    [boards, user]
  );
  const memberCount = boards.length - ownedCount;
  const starredCount = useMemo(
    () => boards.filter((b) => starredIds.includes(b._id)).length,
    [boards, starredIds]
  );

  // Filtered & Sorted Boards Pipeline
  const displayedBoards = useMemo(() => {
    let result = [...boards];

    // 1. Tab filter
    if (activeTab === 'owned') {
      result = result.filter((b) => (b.owner?._id || b.owner) === user?._id);
    } else if (activeTab === 'shared') {
      result = result.filter((b) => (b.owner?._id || b.owner) !== user?._id);
    } else if (activeTab === 'starred') {
      result = result.filter((b) => starredIds.includes(b._id));
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q)
      );
    }

    // 3. Sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [boards, activeTab, searchQuery, sortBy, user, starredIds]);

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <div className="dashboard-container">
          {/* Header & Welcome Hero */}
          <div className="dashboard-hero">
            <div>
              <div className="dashboard-hero-badge">
                <Sparkles size={13} />
                <span>{t('dashboard.workspaceBadge')}</span>
              </div>
              <h1 className="dashboard-hero-title">
                {t('dashboard.welcomeBack', { name: user?.name || '' })} 👋
              </h1>
              <p className="dashboard-hero-subtitle">
                {t('dashboard.subtitle')}
              </p>
            </div>

            <div className="dashboard-hero-cta">
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-hero-primary"
                id="btn-create-board"
                type="button"
              >
                <Plus size={19} />
                <span>{t('dashboard.createBoard')}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics / Stats Cards */}
          <div className="dashboard-stats-grid">
            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-card-icon-box stat-card-icon-blue">
                  <FolderKanban size={22} />
                </div>
                <span className="stat-card-tag">{t('dashboard.activeProjects')}</span>
              </div>
              <div>
                <div className="stat-card-label">{t('dashboard.statsTotalBoards')}</div>
                <div className="stat-card-value">{boards.length}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-card-icon-box stat-card-icon-emerald">
                  <ShieldCheck size={22} />
                </div>
                <span className="stat-card-tag">{t('dashboard.leadOwner')}</span>
              </div>
              <div>
                <div className="stat-card-label">{t('dashboard.statsOwnedBoards')}</div>
                <div className="stat-card-value">{ownedCount}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-card-icon-box stat-card-icon-purple">
                  <Users size={22} />
                </div>
                <span className="stat-card-tag">{t('dashboard.teamShared')}</span>
              </div>
              <div>
                <div className="stat-card-label">{t('dashboard.statsMemberBoards')}</div>
                <div className="stat-card-value">{memberCount}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-card-icon-box stat-card-icon-amber">
                  <Star size={22} />
                </div>
                <span className="stat-card-tag">{t('dashboard.starredBoards')}</span>
              </div>
              <div>
                <div className="stat-card-label">{t('dashboard.starredBoards')}</div>
                <div className="stat-card-value">{starredCount}</div>
              </div>
            </div>
          </div>

          {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

          {/* Workspace Filter & Action Toolbar */}
          {boards.length > 0 && (
            <div className="workspace-toolbar">
              {/* Category Tabs */}
              <div className="workspace-tabs" role="tablist">
                <button
                  type="button"
                  className={`workspace-tab ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  <Layers size={15} />
                  <span>{t('dashboard.allBoards')}</span>
                  <span className="workspace-tab-count">{boards.length}</span>
                </button>

                <button
                  type="button"
                  className={`workspace-tab ${activeTab === 'owned' ? 'active' : ''}`}
                  onClick={() => setActiveTab('owned')}
                >
                  <ShieldCheck size={15} />
                  <span>{t('dashboard.myBoards')}</span>
                  <span className="workspace-tab-count">{ownedCount}</span>
                </button>

                <button
                  type="button"
                  className={`workspace-tab ${activeTab === 'shared' ? 'active' : ''}`}
                  onClick={() => setActiveTab('shared')}
                >
                  <Users size={15} />
                  <span>{t('dashboard.sharedBoards')}</span>
                  <span className="workspace-tab-count">{memberCount}</span>
                </button>

                <button
                  type="button"
                  className={`workspace-tab ${activeTab === 'starred' ? 'active' : ''}`}
                  onClick={() => setActiveTab('starred')}
                >
                  <Star size={15} />
                  <span>{t('dashboard.starredBoards')}</span>
                  <span className="workspace-tab-count">{starredCount}</span>
                </button>
              </div>

              {/* Search, Sort and View Toggle */}
              <div className="workspace-actions">
                <div className="search-box-wrapper">
                  <Search size={15} className="search-icon-inside" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder={t('dashboard.searchBoardsPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="search-clear-btn"
                      title="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <CustomSelect
                  value={sortBy}
                  onChange={setSortBy}
                  options={[
                    { value: 'newest', label: t('dashboard.sortNewest') },
                    { value: 'oldest', label: t('dashboard.sortOldest') },
                    { value: 'name', label: t('dashboard.sortName') }
                  ]}
                  ariaLabel={t('dashboard.sortBy')}
                />

                <div className="view-toggle-group">
                  <button
                    type="button"
                    onClick={() => handleSetViewMode('grid')}
                    className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    title={t('dashboard.viewGrid')}
                    aria-label={t('dashboard.viewGrid')}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetViewMode('list')}
                    className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                    title={t('dashboard.viewList')}
                    aria-label={t('dashboard.viewList')}
                  >
                    <ListIcon size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Boards Display Area */}
          {isLoading ? (
            <div style={{ padding: '4rem 0' }}>
              <LoadingSpinner size="large" message={t('common.loading')} />
            </div>
          ) : boards.length === 0 ? (
            <EmptyState
              icon={Kanban}
              title={t('dashboard.noBoardsTitle')}
              description={t('dashboard.noBoardsDesc')}
              action={
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn btn-primary btn-lg"
                  type="button"
                >
                  <Plus size={18} />
                  <span>{t('dashboard.createFirstBoard')}</span>
                </button>
              }
            />
          ) : displayedBoards.length === 0 ? (
            <div className="card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', marginBottom: '1rem' }}>
                {t('dashboard.noMatchingBoards')}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('all');
                }}
                className="btn btn-secondary btn-sm"
              >
                {t('common.clearFilters')}
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Modern Grid View */
            <div className="boards-grid">
              {displayedBoards.map((board) => {
                const isOwner = (board.owner?._id || board.owner) === user?._id;
                const members = board.members || [];
                const isStarred = starredIds.includes(board._id);
                const gradient = getBoardGradient(board._id, board.title);

                return (
                  <div
                    key={board._id}
                    className="board-card-rich"
                    onClick={() => navigate(`/boards/${board._id}`)}
                    id={`board-card-${board._id}`}
                  >
                    {/* Top Decorative Gradient Banner */}
                    <div
                      className="board-card-banner"
                      style={{ background: gradient.bg }}
                    >
                      <div className="board-banner-icon">
                        <Kanban size={18} />
                      </div>

                      <div className="board-banner-actions">
                        <button
                          type="button"
                          className={`board-star-btn ${isStarred ? 'starred' : ''}`}
                          onClick={(e) => handleToggleStar(board._id, e)}
                          title={isStarred ? t('dashboard.unstarBoard') : t('dashboard.starBoard')}
                          aria-label={isStarred ? t('dashboard.unstarBoard') : t('dashboard.starBoard')}
                        >
                          <Star size={15} fill={isStarred ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="board-card-body">
                      <h3 className="board-card-title">{board.title}</h3>

                      <p className="board-card-desc">
                        {board.description ||
                          (language === 'ar'
                            ? 'لا يوجد وصف مضاف لهذا المشروع.'
                            : 'No description provided for this board.')}
                      </p>

                      <div className="board-card-activity">
                        <Clock size={13} />
                        <span>
                          {t('dashboard.lastActivity')}:{' '}
                          {formatRelativeTime(board.updatedAt || board.createdAt)}
                        </span>
                      </div>

                      {/* Card Footer */}
                      <div className="board-card-footer">
                        <div className="board-members-group">
                          <div className="avatar-stack">
                            {members.slice(0, 3).map((m, idx) => (
                              <div
                                key={m._id || idx}
                                className="avatar"
                                style={{ width: 28, height: 28, fontSize: '0.7rem' }}
                                title={m.name || m.email}
                              >
                                {getInitials(m.name || m.email)}
                              </div>
                            ))}
                          </div>
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.775rem' }}>
                            {members.length} {t('common.members')}
                          </span>
                        </div>

                        <div className="board-footer-actions">
                          <span className={`badge ${isOwner ? 'badge-owner' : 'badge-member'}`}>
                            {isOwner ? (
                              <>
                                <Crown size={11} style={{ marginInlineEnd: 3 }} />
                                {t('dashboard.ownedBadge')}
                              </>
                            ) : (
                              <>
                                <UserCheck size={11} style={{ marginInlineEnd: 3 }} />
                                {t('dashboard.memberBadge')}
                              </>
                            )}
                          </span>

                          {isOwner && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setBoardToDelete(board);
                              }}
                              className="btn btn-ghost btn-sm btn-icon"
                              style={{ color: 'var(--color-danger)', width: 30, height: 30 }}
                              title={t('board.deleteBoard')}
                              aria-label={t('board.deleteBoard')}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}

                          <div className="btn-open-board" title={t('dashboard.openBoard')}>
                            {isRTL ? <ArrowUpLeft size={16} /> : <ArrowUpRight size={16} />}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Ghost Action Tile to Create Board */}
              <div
                className="board-ghost-card"
                onClick={() => setIsModalOpen(true)}
                role="button"
                tabIndex={0}
              >
                <div className="board-ghost-icon-box">
                  <Plus size={24} />
                </div>
                <div className="board-ghost-title">{t('dashboard.createGhostTitle')}</div>
                <div className="board-ghost-desc">{t('dashboard.createGhostDesc')}</div>
              </div>
            </div>
          ) : (
            /* Dense SaaS List View */
            <div className="boards-list-container">
              <div className="boards-list-header">
                <div>{t('dashboard.yourBoards')}</div>
                <div>{t('common.status')}</div>
                <div>{t('common.members')}</div>
                <div>{t('dashboard.lastActivity')}</div>
                <div style={{ textAlign: 'center' }}>{t('common.actions')}</div>
              </div>

              {displayedBoards.map((board) => {
                const isOwner = (board.owner?._id || board.owner) === user?._id;
                const members = board.members || [];
                const isStarred = starredIds.includes(board._id);
                const gradient = getBoardGradient(board._id, board.title);

                return (
                  <div
                    key={board._id}
                    className="boards-list-row"
                    onClick={() => navigate(`/boards/${board._id}`)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <button
                        type="button"
                        onClick={(e) => handleToggleStar(board._id, e)}
                        className={`board-star-btn ${isStarred ? 'starred' : ''}`}
                        style={{
                          background: 'transparent',
                          color: isStarred ? '#fbbf24' : 'var(--color-text-muted)'
                        }}
                      >
                        <Star size={15} fill={isStarred ? 'currentColor' : 'none'} />
                      </button>

                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 'var(--radius-full)',
                          background: gradient.iconBg,
                          flexShrink: 0
                        }}
                      />

                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{board.title}</div>
                        {board.description && (
                          <div
                            style={{
                              fontSize: '0.8rem',
                              color: 'var(--color-text-muted)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '360px'
                            }}
                          >
                            {board.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className={`badge ${isOwner ? 'badge-owner' : 'badge-member'}`}>
                        {isOwner ? t('dashboard.ownedBadge') : t('dashboard.memberBadge')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <div className="avatar-stack">
                        {members.slice(0, 3).map((m, idx) => (
                          <div
                            key={m._id || idx}
                            className="avatar"
                            style={{ width: 24, height: 24, fontSize: '0.65rem' }}
                          >
                            {getInitials(m.name || m.email)}
                          </div>
                        ))}
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        ({members.length})
                      </span>
                    </div>

                    <div style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                      {formatRelativeTime(board.updatedAt || board.createdAt)}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => setBoardToDelete(board)}
                          className="btn btn-ghost btn-sm btn-icon"
                          style={{ color: 'var(--color-danger)' }}
                          title={t('board.deleteBoard')}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => navigate(`/boards/${board._id}`)}
                        className="btn btn-ghost btn-sm btn-icon"
                        title={t('dashboard.openBoard')}
                      >
                        {isRTL ? <ArrowUpLeft size={16} /> : <ArrowUpRight size={16} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Create New Board Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('createBoardModal.title')}
      >
        <form onSubmit={handleCreateBoard} id="create-board-form">
          {createError && (
            <Alert type="danger" message={createError} onClose={() => setCreateError('')} />
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="new-board-title">
              {t('createBoardModal.titleLabel')}
            </label>
            <input
              id="new-board-title"
              type="text"
              className="form-control"
              value={boardTitle}
              onChange={(e) => setBoardTitle(e.target.value)}
              placeholder={t('createBoardModal.titlePlaceholder')}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new-board-desc">
              {t('createBoardModal.descLabel')}
            </label>
            <textarea
              id="new-board-desc"
              className="form-control form-textarea"
              rows="3"
              value={boardDescription}
              onChange={(e) => setBoardDescription(e.target.value)}
              placeholder={t('createBoardModal.descPlaceholder')}
            />
          </div>

          <div
            className="modal-footer"
            style={{ padding: '1rem 0 0', borderTop: 'none', background: 'transparent' }}
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
              disabled={isCreating}
            >
              {t('createBoardModal.cancelBtn')}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isCreating}
              id="btn-save-board"
            >
              {isCreating ? t('common.creating') : t('createBoardModal.submitBtn')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Custom Confirm Dialog for Delete Board */}
      <ConfirmDialog
        isOpen={!!boardToDelete}
        onClose={() => setBoardToDelete(null)}
        onConfirm={confirmDeleteBoard}
        title={t('board.deleteBoard')}
        message={t('dashboard.deleteBoardConfirm', { title: boardToDelete?.title || '' })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Dashboard;
