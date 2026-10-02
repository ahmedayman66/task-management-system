import React from 'react';

const LoadingSpinner = ({ size = 'medium', message = '' }) => {
  const pixelSizes = {
    small: 18,
    medium: 32,
    large: 48
  };

  const dim = pixelSizes[size] || 32;

  return (
    <div className="spinner-container">
      <svg
        style={{
          width: `${dim}px`,
          height: `${dim}px`,
          animation: 'spin 0.8s linear infinite'
        }}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="var(--color-border-medium)"
          strokeWidth="3"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="var(--color-primary)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {message && <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{message}</p>}
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
