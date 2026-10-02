import React, { useState } from 'react';
import Modal from './Modal';
import Alert from './Alert';
import ConfirmDialog from './ConfirmDialog';
import { UserPlus, Trash2, Crown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';

const BoardMembersModal = ({
  isOpen,
  onClose,
  board,
  onAddMember,
  onRemoveMember
}) => {
  const { user: currentUser } = useAuth();
  const { t } = useI18n();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

  const isOwner =
    board?.owner?._id?.toString() === currentUser?._id?.toString() ||
    board?.owner?.toString() === currentUser?._id?.toString();

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');
      await onAddMember(board._id, { email: email.trim().toLowerCase() });
      setEmail('');
      setSuccess(t('membersModal.memberAddedSuccess'));
    } catch (err) {
      setError(err.message || t('errors.generic'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    try {
      setError('');
      const targetId = memberToRemove;
      setMemberToRemove(null);
      await onRemoveMember(board._id, targetId);
      setSuccess(t('membersModal.memberRemovedSuccess'));
    } catch (err) {
      setError(err.message || t('errors.generic'));
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('membersModal.title')}
      maxWidth="500px"
    >
      <div>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
          {t('membersModal.subtitle')}
        </p>

        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        {/* Add Member Form (Owner only or based on authorization) */}
        {isOwner && (
          <form onSubmit={handleAddMember} style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" htmlFor="member-email">
              {t('membersModal.addMemberLabel')}
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                id="member-email"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('membersModal.addMemberPlaceholder')}
                required
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{ flexShrink: 0 }}
              >
                <UserPlus size={16} />
                <span>{isSubmitting ? t('membersModal.adding') : t('membersModal.addMemberBtn')}</span>
              </button>
            </div>
          </form>
        )}

        {/* Members List */}
        <div>
          <label className="form-label" style={{ display: 'block', marginBottom: '0.65rem' }}>
            {t('membersModal.currentMembers', { count: board?.members?.length || 0 })}
          </label>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              maxHeight: '280px',
              overflowY: 'auto'
            }}
          >
            {board?.members?.map((member) => {
              const memberId = member._id?.toString() || member.toString();
              const isBoardOwner =
                (board.owner?._id ? board.owner._id.toString() : board.owner?.toString()) === memberId;

              return (
                <div
                  key={memberId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: 'var(--color-bg-surface-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                      {getInitials(member.name || member.email)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        {member.name || member.email}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {member.email}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isBoardOwner ? (
                      <span className="badge badge-owner" style={{ gap: '0.25rem' }}>
                        <Crown size={12} />
                        <span>{t('membersModal.ownerBadge')}</span>
                      </span>
                    ) : (
                      <>
                        <span className="badge badge-member">
                          {t('membersModal.memberBadge')}
                        </span>
                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => setMemberToRemove(memberId)}
                            className="btn btn-ghost btn-sm btn-icon"
                            style={{ color: 'var(--color-danger)' }}
                            title={t('membersModal.removeMemberBtn')}
                            aria-label={t('membersModal.removeMemberBtn')}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(memberToRemove)}
        title={t('membersModal.removeConfirm')}
        message={t('membersModal.removeConfirm')}
        confirmText={t('membersModal.removeMemberBtn')}
        cancelText={t('common.cancel')}
        isDanger={true}
        onConfirm={handleConfirmRemove}
        onClose={() => setMemberToRemove(null)}
      />
    </Modal>
  );
};

export default BoardMembersModal;
