import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Alert from './Alert';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import { useToast } from '../context/ToastContext';
import { authApi } from '../api/authApi';
import { User, Mail, Lock, ShieldCheck, Calendar, KeyRound, Check } from 'lucide-react';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const { t, language } = useI18n();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Prefill user data when modal opens
  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '');
      setEmail(user.email || '');
      setCurrentPassword('');
      setNewPassword('');
      setShowPasswordSection(false);
      setError('');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const getInitials = (nameStr) => {
    if (!nameStr) return 'U';
    return nameStr
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'long'
      }).format(date);
    } catch {
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError(language === 'ar' ? 'يرجى كتابة الاسم الكامل' : 'Please provide your full name');
      return;
    }

    if (!email.trim()) {
      setError(language === 'ar' ? 'يرجى كتابة البريد الإلكتروني' : 'Please provide an email address');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError(language === 'ar' ? 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' : 'New password must be at least 6 characters long');
      return;
    }

    if (newPassword && !currentPassword) {
      setError(language === 'ar' ? 'يرجى كتابة كلمة المرور الحالية لتأكيد التغيير' : 'Current password is required to change password');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase()
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await authApi.updateMe(payload);
      if (res?.success && res?.data?.user) {
        updateUser(res.data.user);
        toast.success(t('profile.successUpdate'));
        onClose();
      }
    } catch (err) {
      console.error('Update profile error:', err);
      const msg = err.response?.data?.message || err.message || t('profile.errorUpdate');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('profile.modalTitle')}
      maxWidth="500px"
    >
      <form onSubmit={handleSubmit} className="profile-modal-form">
        {/* Profile Card Header Banner */}
        <div className="profile-hero-card">
          <div className="profile-hero-avatar">
            {getInitials(name || user?.name)}
          </div>
          <div className="profile-hero-info">
            <h3 className="profile-hero-name">{user?.name}</h3>
            <p className="profile-hero-email">{user?.email}</p>
            <div className="profile-hero-tags">
              <span className="profile-tag-active">
                <span className="status-dot-pulse" />
                <span>{t('profile.activeMember')}</span>
              </span>
              {user?.createdAt && (
                <span className="profile-tag-date">
                  <Calendar size={12} />
                  <span>{t('profile.memberSince')} {formatDate(user.createdAt)}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div style={{ marginTop: '1rem' }}>
            <Alert type="danger" message={error} onClose={() => setError('')} />
          </div>
        )}

        {/* Form Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="profile-name">
              <User size={14} style={{ display: 'inline', marginInlineEnd: '0.35rem', verticalAlign: 'text-top' }} />
              <span>{t('profile.fullName')}</span>
            </label>
            <input
              id="profile-name"
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('profile.fullNamePlaceholder')}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="profile-email">
              <Mail size={14} style={{ display: 'inline', marginInlineEnd: '0.35rem', verticalAlign: 'text-top' }} />
              <span>{t('profile.email')}</span>
            </label>
            <input
              id="profile-email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          {/* Collapsible Security & Password Section */}
          <div className="profile-security-box">
            <button
              type="button"
              className="profile-security-toggle"
              onClick={() => setShowPasswordSection((prev) => !prev)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <KeyRound size={15} style={{ color: 'var(--color-primary)' }} />
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t('profile.securitySection')}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>
                {showPasswordSection ? (language === 'ar' ? 'إخفاء' : 'Hide') : (language === 'ar' ? 'تعديل' : 'Edit')}
              </span>
            </button>

            {showPasswordSection && (
              <div className="profile-password-fields">
                <p style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                  {t('profile.changePasswordHint')}
                </p>

                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="form-label" htmlFor="current-password" style={{ fontSize: '0.775rem' }}>
                    {t('profile.currentPassword')}
                  </label>
                  <input
                    id="current-password"
                    type="password"
                    className="form-control"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="new-password" style={{ fontSize: '0.775rem' }}>
                    {t('profile.newPassword')}
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="modal-actions" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            id="btn-save-profile"
          >
            {isLoading ? (
              <LoadingSpinner size="small" message="" />
            ) : (
              <>
                <Check size={16} />
                <span>{t('profile.saveChanges')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProfileModal;
