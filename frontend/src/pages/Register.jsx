import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import { useTheme } from '../context/ThemeContext';
import Alert from '../components/Alert';
import { Kanban, ArrowRight, ArrowLeft, Sun, Moon, Globe } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const { t, language, toggleLanguage, isRTL } = useI18n();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError(t('auth.nameRequired'));
      return;
    }
    if (!email.trim()) {
      setError(t('auth.emailRequired'));
      return;
    }
    if (!password) {
      setError(t('auth.passwordRequired'));
      return;
    }

    if (password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await register(name.trim(), email.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = (err.message || '').toLowerCase();
      if (
        err.code === 'EMAIL_EXISTS' ||
        err.code === 'DUPLICATE_KEY' ||
        err.status === 409 ||
        msg.includes('already')
      ) {
        setError(t('auth.emailAlreadyInUse'));
      } else if (err.code === 'VALIDATION_ERROR' && err.details?.length) {
        setError(err.details.map((d) => d.message).join(', '));
      } else if (err.code === 'VALIDATION_ERROR') {
        setError(err.message || t('auth.registerFailed'));
      } else {
        setError(t('auth.registerFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* Top Bar with Language and Theme controls */}
      <div className="auth-top-controls">
        <button
          onClick={toggleLanguage}
          className="btn btn-ghost btn-sm"
          type="button"
          aria-label={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
        >
          <Globe size={16} />
          <span>{language === 'ar' ? 'English' : 'العربية'}</span>
        </button>

        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-sm btn-icon"
          type="button"
          aria-label={isDark ? t('nav.lightMode') : t('nav.darkMode')}
          title={isDark ? t('nav.lightMode') : t('nav.darkMode')}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="auth-card card">
        <div className="auth-header">
          <div className="brand-icon-box" style={{ width: 48, height: 48, margin: '0 auto 1rem' }}>
            <Kanban size={26} />
          </div>
          <h1>{t('auth.registerTitle')}</h1>
          <p>{t('auth.registerSubtitle')}</p>
        </div>

        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit} id="register-form">
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">
              {t('auth.name')}
            </label>
            <input
              id="reg-name"
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('auth.namePlaceholder')}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">
              {t('auth.email')}
            </label>
            <input
              id="reg-email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">
              {t('auth.password')}
            </label>
            <input
              id="reg-password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm-password">
              {t('auth.confirmPassword')}
            </label>
            <input
              id="reg-confirm-password"
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={isLoading}
            id="btn-register-submit"
          >
            <span>{isLoading ? t('auth.registering') : t('auth.registerButton')}</span>
            {!isLoading && (isRTL ? <ArrowLeft size={18} /> : <ArrowRight size={18} />)}
          </button>
        </form>

        <div className="auth-footer">
          <span>{t('auth.haveAccount')}</span>{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            {t('auth.goToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
