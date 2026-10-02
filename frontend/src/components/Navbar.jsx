import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import { useTheme } from '../context/ThemeContext';
import { Kanban, LogOut, LayoutDashboard, Plus, Sun, Moon } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import ProfileModal from './ProfileModal';

const Navbar = ({ onOpenCreateBoard = null }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { t, language, changeLanguage } = useI18n();
  const { isDark, toggleTheme } = useTheme();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
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

  const isBoardPage = location.pathname.startsWith('/boards/');

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link to="/dashboard" className="nav-brand" aria-label="TaskFlow Dashboard">
            <div className="brand-icon-box">
              <Kanban size={18} />
            </div>
            <span>{t('common.appName')}</span>
          </Link>

          {isAuthenticated && isBoardPage && (
            <Link
              to="/dashboard"
              className="btn btn-ghost btn-sm"
              style={{ display: 'flex', gap: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}
            >
              <LayoutDashboard size={14} />
              <span>{t('nav.dashboard')}</span>
            </Link>
          )}
        </div>

        {/* Right Controls */}
        <div className="nav-controls">
          {/* Segmented Language Switcher Pill */}
          <div className="segmented-lang-pill">
            <button
              type="button"
              onClick={() => changeLanguage('ar')}
              className={`segmented-lang-btn ${language === 'ar' ? 'active' : ''}`}
            >
              العربية
            </button>
            <button
              type="button"
              onClick={() => changeLanguage('en')}
              className={`segmented-lang-btn ${language === 'en' ? 'active' : ''}`}
            >
              EN
            </button>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-sm btn-icon"
            type="button"
            id="btn-nav-theme"
            aria-label={isDark ? t('nav.lightMode') : t('nav.darkMode')}
            title={isDark ? t('nav.lightMode') : t('nav.darkMode')}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {isAuthenticated && (
            <div className="nav-user-area">
              {onOpenCreateBoard && (
                <button
                  onClick={onOpenCreateBoard}
                  className="btn btn-primary btn-sm"
                  type="button"
                  id="btn-nav-create-board"
                >
                  <Plus size={15} />
                  <span>{t('nav.newBoard')}</span>
                </button>
              )}

              <div
                className="user-badge"
                title={t('nav.viewProfile')}
                onClick={() => setShowProfileModal(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setShowProfileModal(true);
                  }
                }}
                id="btn-user-profile"
              >
                <div className="avatar">
                  {getInitials(user?.name)}
                  <span className="avatar-status-dot" />
                </div>
                <span className="user-badge-name">
                  {user?.name}
                </span>
              </div>

              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="btn-nav-logout"
                title={t('nav.logout')}
                type="button"
                id="btn-logout"
                aria-label={t('nav.logout')}
              >
                <LogOut size={15} className="logout-nav-icon" />
                <span className="logout-nav-text">{t('nav.logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        title={t('nav.logoutConfirmTitle')}
        message={t('nav.logoutConfirmMessage')}
        confirmText={t('nav.logoutConfirmBtn')}
        cancelText={t('common.cancel')}
        isDanger={true}
        icon={LogOut}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </header>
  );
};

export default Navbar;
