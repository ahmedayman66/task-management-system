import React from 'react';
import { Link } from 'react-router-dom';
import { Kanban, ArrowLeft, ArrowRight } from 'lucide-react';
import { useI18n } from '../i18n';

const NotFound = () => {
  const { t, isRTL } = useI18n();

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="brand-icon-box" style={{ width: 56, height: 56, margin: '0 auto 1.5rem' }}>
          <Kanban size={32} />
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
          {t('notFoundPage.title')}
        </h1>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>
          {t('notFoundPage.subtitle')}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          {t('notFoundPage.description')}
        </p>

        <Link to="/dashboard" className="btn btn-primary" style={{ display: 'inline-flex', padding: '0.75rem 1.5rem' }}>
          {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
          <span>{t('notFoundPage.backBtn')}</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
