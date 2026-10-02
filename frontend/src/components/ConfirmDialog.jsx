import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';
import { useI18n } from '../i18n';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title,
  message,
  confirmText,
  confirmLabel,
  cancelText,
  cancelLabel,
  isDanger = true,
  isDestructive,
  isLoading = false,
  icon: IconComponent = AlertTriangle
}) => {
  const { t } = useI18n();

  const handleClose = onClose || onCancel;
  const finalConfirmText = confirmText || confirmLabel || t('common.confirm');
  const finalCancelText = cancelText || cancelLabel || t('common.cancel');
  const finalIsDanger = isDestructive !== undefined ? isDestructive : isDanger;

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title || t('common.confirm')} maxWidth="440px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-full)',
              backgroundColor: finalIsDanger ? 'var(--color-danger-subtle)' : 'var(--color-primary-subtle)',
              color: finalIsDanger ? 'var(--color-danger)' : 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <IconComponent size={22} />
          </div>

          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.55, margin: 0 }}>
              {message}
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--color-border-subtle)'
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            {finalCancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`btn ${finalIsDanger ? 'btn-danger' : 'btn-primary'}`}
            disabled={isLoading}
          >
            {isLoading ? t('common.saving') : finalConfirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
