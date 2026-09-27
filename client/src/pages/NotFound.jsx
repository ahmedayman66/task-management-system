import React from 'react';
import { Link } from 'react-router-dom';
import { Kanban, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="brand-icon-box" style={{ width: 56, height: 56, margin: '0 auto 1.5rem' }}>
          <Kanban size={32} />
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary-border)', marginBottom: '0.5rem' }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          The page you are looking for doesn't exist or has been moved.
        </p>

        <Link to="/dashboard" className="btn btn-primary" style={{ display: 'inline-flex', padding: '0.75rem 1.5rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
