import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const Alert = ({ type = 'danger', message, children, onClose }) => {
  const content = message || children;
  if (!content) return null;

  const iconMap = {
    danger: <AlertCircle size={18} style={{ flexShrink: 0 }} />,
    success: <CheckCircle size={18} style={{ flexShrink: 0 }} />,
    info: <Info size={18} style={{ flexShrink: 0 }} />
  };

  return (
    <div className={`alert alert-${type}`}>
      {iconMap[type] || iconMap.danger}
      <div style={{ flex: 1 }}>{content}</div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;
