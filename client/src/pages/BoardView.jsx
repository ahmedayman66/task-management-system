import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
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
import {
  Plus,
  Users,
  Search,
  Filter,
  Settings,
  Kanban,
  ArrowLeft
} from 'lucide-react';

const BoardView = () => {
  const { boardId } = useParams();
  const { user } = useAuth();
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
        setTasks(tasksRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load board details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (boardId) {
      loadBoardData();
    }
  }, [boardId]);

  // Filter tasks based on search and filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search title or description
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = (task.description || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // Status filter
      if (statusFilter && task.status !== statusFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter && task.priority !== priorityFilter) {
        return false;
      }

      // Assignee filter
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
      }
    } catch (err) {
      alert(err.message || 'Failed to create list');
    }
  };

  const handleUpdateListTitle = async (listId, title) => {
    try {
      const res = await listApi.updateList(listId, { title });
      if (res.success && res.data?.list) {
        setLists(lists.map((l) => (l._id === listId ? res.data.list : l)));
      }
    } catch (err) {
      alert(err.message || 'Failed to update list title');
    }
  };

  const handleDeleteList = async (listId) => {
    try {
      await listApi.deleteList(listId);
      setLists(lists.filter((l) => l._id !== listId));
      setTasks(tasks.filter((t) => (t.list?._id || t.list) !== listId));
    } catch (err) {
      alert(err.message || 'Failed to delete list');
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

  const handleSaveTask = async (taskData, taskId, currentListId) => {
    if (taskId) {
      // Update existing task
      const res = await taskApi.updateTask(taskId, taskData);
      if (res.success && res.data?.task) {
        setTasks(tasks.map((t) => (t._id === taskId ? res.data.task : t)));
      }
    } else {
      // Create new task in currentListId
      const res = await taskApi.createTask(currentListId, taskData);
      if (res.success && res.data?.task) {
        setTasks([...tasks, res.data.task]);
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await taskApi.updateTaskStatus(taskId, newStatus);
      if (res.success && res.data?.task) {
        setTasks(tasks.map((t) => (t._id === taskId ? res.data.task : t)));
      }
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskApi.deleteTask(taskId);
      setTasks(tasks.filter((t) => t._id !== taskId));
    } catch (err) {
      alert(err.message || 'Failed to delete task');
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
      }
    } catch (err) {
      alert(err.message || 'Failed to update board');
    }
  };

  const handleAddMember = async (bId, data) => {
    const res = await boardApi.addMember(bId, data);
    if (res.success && res.data?.board) {
      setBoard(res.data.board);
    }
  };

  const handleRemoveMember = async (bId, userId) => {
    const res = await boardApi.removeMember(bId, userId);
    if (res.success && res.data?.board) {
      setBoard(res.data.board);
      // Refresh tasks in case unassigned
      const refreshedTasks = await taskApi.getTasks({ boardId, limit: 100 });
      if (refreshedTasks.success) setTasks(refreshedTasks.data);
    }
  };

  const isOwner =
    board?.owner?._id === user?._id || board?.owner === user?._id;

  if (isLoading) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="flex-center" style={{ flex: 1 }}>
          <LoadingSpinner size="large" message="Loading Kanban board..." />
        </div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="container" style={{ padding: '3rem 0' }}>
          <Alert type="danger" message={error || 'Board not found'} />
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
            style={{ marginTop: '1rem' }}
          >
            <ArrowLeft size={16} />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />

      {/* Board Header */}
      <div className="board-view-header">
        <div className="board-header-top">
          <div className="board-title-section">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-ghost btn-icon btn-sm"
              title="Back to Dashboard"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{board.title}</h1>
                {isOwner && (
                  <button
                    onClick={() => setIsBoardSettingsOpen(true)}
                    className="btn btn-ghost btn-icon btn-sm"
                    title="Board Settings"
                  >
                    <Settings size={15} />
                  </button>
                )}
              </div>
              {board.description && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                  {board.description}
                </p>
              )}
            </div>
          </div>

          <div className="board-header-actions">
            <button
              onClick={() => setIsMembersModalOpen(true)}
              className="btn btn-secondary btn-sm"
              id="btn-board-members"
            >
              <Users size={16} />
              <span>Members ({board.members?.length || 1})</span>
            </button>

            <button
              onClick={() => setIsAddListModalOpen(true)}
              className="btn btn-primary btn-sm"
              id="btn-add-list"
            >
              <Plus size={16} />
              <span>Add List</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="board-filter-bar">
          <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: '300px' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', paddingTop: '0.4rem', paddingBottom: '0.4rem', fontSize: '0.85rem' }}
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              style={{ padding: '0.4rem 0.65rem', fontSize: '0.825rem', width: 'auto' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>

            <select
              className="form-select"
              style={{ padding: '0.4rem 0.65rem', fontSize: '0.825rem', width: 'auto' }}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>

            <select
              className="form-select"
              style={{ padding: '0.4rem 0.65rem', fontSize: '0.825rem', width: 'auto' }}
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
            >
              <option value="">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {board.members?.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name || m.email}
                </option>
              ))}
            </select>

            {(searchQuery || statusFilter || priorityFilter || assigneeFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                  setPriorityFilter('');
                  setAssigneeFilter('');
                }}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.8rem' }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="kanban-container">
        {lists.length === 0 ? (
          <div style={{ width: '100%', maxWidth: '600px', margin: '4rem auto' }}>
            <EmptyState
              icon={Kanban}
              title="This board has no lists yet"
              description="Lists represent stages in your workflow, such as 'To Do', 'In Progress', and 'Done'."
              action={
                <button
                  onClick={() => setIsAddListModalOpen(true)}
                  className="btn btn-primary"
                >
                  <Plus size={16} />
                  <span>Create Your First List</span>
                </button>
              }
            />
          </div>
        ) : (
          lists.map((list) => (
            <ListColumn
              key={list._id}
              list={list}
              tasks={tasksByList[list._id] || []}
              onAddTask={handleOpenAddTask}
              onEditTask={handleOpenEditTask}
              onStatusChange={handleStatusChange}
              onDeleteTask={handleDeleteTask}
              onUpdateListTitle={handleUpdateListTitle}
              onDeleteList={handleDeleteList}
            />
          ))
        )}

        {/* Quick Add List Column placeholder */}
        {lists.length > 0 && (
          <div style={{ minWidth: '280px' }}>
            <button
              onClick={() => setIsAddListModalOpen(true)}
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '0.85rem',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px dashed var(--border-medium)'
              }}
            >
              <Plus size={16} />
              <span>Add Another List</span>
            </button>
          </div>
        )}
      </div>

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
        title="Add New List"
        maxWidth="400px"
      >
        <form onSubmit={handleCreateList}>
          <div className="form-group">
            <label className="form-label" htmlFor="new-list-title">List Title *</label>
            <input
              id="new-list-title"
              type="text"
              className="form-input"
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              placeholder="e.g. In Review"
              required
              autoFocus
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0', borderTop: 'none' }}>
            <button
              type="button"
              onClick={() => setIsAddListModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="btn-save-list">
              Create List
            </button>
          </div>
        </form>
      </Modal>

      {/* Board Settings Modal */}
      <Modal
        isOpen={isBoardSettingsOpen}
        onClose={() => setIsBoardSettingsOpen(false)}
        title="Board Settings"
      >
        <form onSubmit={handleSaveBoardSettings}>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-board-title">Title *</label>
            <input
              id="edit-board-title"
              type="text"
              className="form-input"
              value={editBoardTitle}
              onChange={(e) => setEditBoardTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-board-desc">Description</label>
            <textarea
              id="edit-board-desc"
              className="form-textarea"
              rows="3"
              value={editBoardDescription}
              onChange={(e) => setEditBoardDescription(e.target.value)}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0', borderTop: 'none' }}>
            <button
              type="button"
              onClick={() => setIsBoardSettingsOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BoardView;
