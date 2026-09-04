/** Stats bar: total + active students */
function StatsBar({ students }) {
  const total  = students.length;

  return (
    <div className="stats-bar">
      <div className="stat-card">
        <div className="stat-value">{total}</div>
        <div className="stat-label">Total Students</div>
      </div>
      <div className="stat-card">
        <div className="stat-value" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
          {total}
        </div>
        <div className="stat-label">Active Students</div>
      </div>
      <div className="stat-card">
        <div className="stat-value" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
          {total > 0 ? new Date().getFullYear() : '—'}
        </div>
        <div className="stat-label">Current Year</div>
      </div>
    </div>
  );
}

export default StatsBar;
