import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { boardApi } from '../api/boardApi';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { Plus, Kanban, Users, Trash2, ArrowUpRight } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Board Form State
  const [boardTitle, setBoardTitle] = useState('');
  const [boardDescription, setBoardDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const fetchBoards = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await boardApi.getBoards();
      if (res.success && res.data) {
        setBoards(res.data.boards || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch boards');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!boardTitle.trim()) {
      setCreateError('Board title is required');
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
        navigate(`/boards/${res.data.board._id}`);
      }
    } catch (err) {
      setCreateError(err.message || 'Failed to create board');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteBoard = async (e, boardId, boardTitle) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete board "${boardTitle}" and all its lists & tasks?`)) {
      try {
        await boardApi.deleteBoard(boardId);
        setBoards(boards.filter((b) => b._id !== boardId));
      } catch (err) {
        alert(err.message || 'Failed to delete board');
      }
    }
  };

  return (
    <div className="app-container">
      <Navbar onOpenCreateBoard={() => setIsModalOpen(true)} />

      <main className="main-content" style={{ padding: '2.5rem 0' }}>
        <div className="container">
          <div className="dashboard-header">
            <div>
              <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>
                Welcome, {user?.name || 'Workspace Member'}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
                Manage your projects, team tasks, and workflows.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary"
              id="btn-create-board"
            >
              <Plus size={18} />
              <span>Create Board</span>
            </button>
          </div>

          {error && (
            <Alert type="danger" message={error} onClose={() => setError('')} />
          )}

          {isLoading ? (
            <div style={{ padding: '4rem 0' }}>
              <LoadingSpinner size="large" message="Loading your boards..." />
            </div>
          ) : boards.length === 0 ? (
            <EmptyState
              icon={Kanban}
              title="You don't have any boards yet"
              description="Create your first board to organize your tasks, team members, and workflows."
              action={
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn btn-primary"
                >
                  <Plus size={18} />
                  <span>Create your first board</span>
                </button>
              }
            />
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.15rem', color: 'var(--text-secondary)' }}>
                  My Boards ({boards.length})
                </h2>
              </div>

              <div className="boards-grid">
                {boards.map((board) => {
                  const isOwner =
                    board.owner?._id === user?._id || board.owner === user?._id;

                  return (
                    <div
                      key={board._id}
                      className="board-card"
                      onClick={() => navigate(`/boards/${board._id}`)}
                      id={`board-card-${board._id}`}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <h3 className="board-card-title">{board.title}</h3>
                          <ArrowUpRight size={18} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        {board.description && (
                          <p className="board-card-desc">{board.description}</p>
                        )}
                      </div>

                      <div className="board-card-meta">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Users size={14} />
                          <span>{board.members?.length || 1} members</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {isOwner && (
                            <span style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 600 }}>
                              Owner
                            </span>
                          )}

                          {isOwner && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteBoard(e, board._id, board.title)}
                              className="btn btn-ghost btn-icon btn-sm"
                              style={{ color: 'var(--text-muted)', padding: '0.2rem' }}
                              title="Delete Board"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create Board Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Board"
      >
        <form onSubmit={handleCreateBoard} id="create-board-form">
          {createError && (
            <Alert type="danger" message={createError} onClose={() => setCreateError('')} />
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="new-board-title">Board Title *</label>
            <input
              id="new-board-title"
              type="text"
              className="form-input"
              value={boardTitle}
              onChange={(e) => setBoardTitle(e.target.value)}
              placeholder="e.g. Website Redesign"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new-board-desc">Description</label>
            <textarea
              id="new-board-desc"
              className="form-textarea"
              rows="3"
              value={boardDescription}
              onChange={(e) => setBoardDescription(e.target.value)}
              placeholder="Brief summary of the board objectives..."
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0', borderTop: 'none' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isCreating}
              id="btn-save-board"
            >
              {isCreating ? 'Creating...' : 'Create Board'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
