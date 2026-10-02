import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { useI18n } from '../i18n';

const Alert = ({ type = 'danger', message, children, onClose }) => {
  const { t } = useI18n();
  const content = message || children;
  if (!content) return null;

  const iconMap = {
    danger: <AlertCircle size={18} style={{ flexShrink: 0 }} />,
    success: <CheckCircle size={18} style={{ flexShrink: 0 }} />,
    warning: <AlertCircle size={18} style={{ flexShrink: 0 }} />,
    info: <Info size={18} style={{ flexShrink: 0 }} />
  };

  return (
    <div className={`alert alert-${type}`} role="alert">
      <div className="alert-icon-wrapper">
        {iconMap[type] || iconMap.danger}
      </div>
      <div className="alert-content">{content}</div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="alert-close-btn"
          aria-label={t('common.close')}
          title={t('common.close')}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;
