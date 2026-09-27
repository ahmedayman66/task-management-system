import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Kanban, LogOut, LayoutDashboard, Plus } from 'lucide-react';

const Navbar = ({ onOpenCreateBoard = null }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
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

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="nav-brand">
          <div className="brand-icon-box">
            <Kanban size={20} />
          </div>
          <span>TaskFlow</span>
        </Link>

        {isAuthenticated && (
          <div className="nav-user-area">
            <Link to="/dashboard" className="btn btn-ghost btn-sm" style={{ display: 'flex', gap: '0.4rem' }}>
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </Link>

            {onOpenCreateBoard && (
              <button
                onClick={onOpenCreateBoard}
                className="btn btn-primary btn-sm"
                type="button"
                id="btn-nav-create-board"
              >
                <Plus size={16} />
                <span>New Board</span>
              </button>
            )}

            <div className="user-badge">
              <div className="avatar" title={user?.email}>
                {getInitials(user?.name)}
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, display: 'none', sm: 'inline' }}>
                {user?.name}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              title="Sign Out"
              type="button"
              id="btn-logout"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
