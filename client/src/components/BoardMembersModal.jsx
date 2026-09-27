import React, { useState } from 'react';
import Modal from './Modal';
import Alert from './Alert';
import { UserPlus, Trash2, Crown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const BoardMembersModal = ({
  isOpen,
  onClose,
  board,
  onAddMember,
  onRemoveMember
}) => {
  const { user: currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwner = board?.owner?._id?.toString() === currentUser?._id?.toString() ||
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
      setSuccess('Member added successfully!');
    } catch (err) {
      setError(err.message || 'Failed to add member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (userId) => {
    if (window.confirm('Remove this member from the board?')) {
      try {
        setError('');
        await onRemoveMember(board._id, userId);
      } catch (err) {
        setError(err.message || 'Failed to remove member');
      }
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
      title="Board Members"
      maxWidth="480px"
    >
      <div>
        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        {/* Add Member Form */}
        <form onSubmit={handleAddMember} style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" htmlFor="member-email">Invite New Member</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              id="member-email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={isSubmitting}
            >
              <UserPlus size={16} />
              <span>Invite</span>
            </button>
          </div>
        </form>

        {/* Members List */}
        <div>
          <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Current Members ({board?.members?.length || 0})
          </label>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              maxHeight: '260px',
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
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="avatar" style={{ width: 30, height: 30, fontSize: '0.75rem' }}>
                      {getInitials(member.name || member.email)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        {member.name || 'Unnamed User'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {member.email}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isBoardOwner ? (
                      <span
                        className="badge"
                        style={{
                          backgroundColor: 'rgba(245, 158, 11, 0.15)',
                          color: '#fbbf24',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem'
                        }}
                      >
                        <Crown size={12} /> Owner
                      </span>
                    ) : (
                      isOwner && (
                        <button
                          type="button"
                          onClick={() => handleRemove(memberId)}
                          className="btn btn-ghost btn-icon btn-sm"
                          style={{ color: 'var(--danger)' }}
                          title="Remove Member"
                        >
                          <Trash2 size={15} />
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BoardMembersModal;
