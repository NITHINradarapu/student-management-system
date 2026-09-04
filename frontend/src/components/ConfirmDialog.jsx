/**
 * ConfirmDialog — confirmation modal for destructive actions.
 * Props: type ('archive'|'delete'), studentName, onConfirm(), onCancel(), loading
 */
function ConfirmDialog({ type, studentName, onConfirm, onCancel, loading }) {
  const isDelete  = type === 'delete';
  const iconClass = isDelete ? 'danger' : 'warning';
  const icon      = isDelete ? '🗑' : '⏏';

  const title = isDelete
    ? 'Permanently Delete Student'
    : 'Archive Student';

  const body = isDelete
    ? `This will permanently remove "${studentName}" from the database. This action cannot be undone.`
    : `"${studentName}" will be archived and hidden from the student list. You can view archived records in the database directly.`;

  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal modal-sm" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <div className={`confirm-icon ${iconClass}`}>{icon}</div>
        <h2 className="confirm-title" id="confirm-title">{title}</h2>
        <p className="confirm-body">{body}</p>

        <div className="modal-footer" style={{ justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button
            className={`btn ${isDelete ? 'btn-danger' : 'btn-secondary'}`}
            style={!isDelete ? { color: 'var(--warning)', borderColor: 'rgba(245,158,11,0.4)' } : undefined}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading
              ? '⟳ Processing…'
              : isDelete ? '🗑 Delete Permanently' : '⏏ Archive'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
