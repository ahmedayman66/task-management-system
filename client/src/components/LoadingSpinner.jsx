import React from 'react';

const LoadingSpinner = ({ size = 'medium', message = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const pixelSizes = {
    small: 18,
    medium: 32,
    large: 48
  };

  const dim = pixelSizes[size] || 32;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1rem' }}>
      <svg
        style={{
          width: `${dim}px`,
          height: `${dim}px`,
          animation: 'spin 1s linear infinite'
        }}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="3"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="#6366f1"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {message && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{message}</p>}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
