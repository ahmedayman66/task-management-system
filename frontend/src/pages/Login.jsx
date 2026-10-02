import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import { useTheme } from '../context/ThemeContext';
import Alert from '../components/Alert';
import { Kanban, ArrowRight, ArrowLeft, Sun, Moon, Globe } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { t, language, toggleLanguage, isRTL } = useI18n();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError(t('auth.fieldsRequired'));
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = (err.message || '').toLowerCase();
      if (
        err.code === 'INVALID_CREDENTIALS' ||
        err.status === 401 ||
        msg.includes('invalid') ||
        msg.includes('credentials') ||
        msg.includes('password') ||
        msg.includes('login') ||
        msg.includes('failed')
      ) {
        setError(t('auth.invalidCredentials'));
      } else {
        setError(t('auth.loginFailed'));
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
          <h1>{t('auth.loginTitle')}</h1>
          <p>{t('auth.loginSubtitle')}</p>
        </div>

        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit} id="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              {t('auth.email')}
            </label>
            <input
              id="login-email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              {t('auth.password')}
            </label>
            <input
              id="login-password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={isLoading}
            id="btn-login-submit"
          >
            <span>{isLoading ? t('auth.loggingIn') : t('auth.loginButton')}</span>
            {!isLoading && (isRTL ? <ArrowLeft size={18} /> : <ArrowRight size={18} />)}
          </button>
        </form>

        <div className="auth-footer">
          <span>{t('auth.noAccount')}</span>{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>
            {t('auth.goToRegister')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
