import SkeletonRow from './SkeletonRow';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

/**
 * StudentTable — renders the student list.
 * Props: students[], loading, onEdit(student), onSoftDelete(student), onHardDelete(student)
 */
function StudentTable({ students, loading, onEdit, onSoftDelete, onHardDelete }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Course</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            : students.length === 0
              ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <div className="empty-icon">🎓</div>
                      <div className="empty-title">No students found</div>
                      <div className="empty-body">Add your first student using the button above.</div>
                    </div>
                  </td>
                </tr>
              )
              : students.map((s) => (
                <tr key={s.id} className="fade-in">
                  <td>
                    <div className="cell-name">{s.name}</div>
                  </td>
                  <td>
                    <div className="cell-email">{s.email}</div>
                  </td>
                  <td>
                    <span className="cell-course">{s.course}</span>
                  </td>
                  <td>
                    <span className="cell-date">{formatDate(s.createdAt)}</span>
                  </td>
                  <td>
                    <div className="cell-actions">
                      <button
                        className="btn-icon edit"
                        title="Edit student"
                        onClick={() => onEdit(s)}
                      >✎</button>
                      <button
                        className="btn-icon archive"
                        title="Archive student (soft delete)"
                        onClick={() => onSoftDelete(s)}
                      >⏏</button>
                      <button
                        className="btn-icon delete"
                        title="Permanently delete student"
                        onClick={() => onHardDelete(s)}
                      >🗑</button>
                    </div>
                  </td>
                </tr>
              ))
          }
        </tbody>
      </table>
    </div>
  );
}

export default StudentTable;
