/** Skeleton loader rows while students are being fetched */
function SkeletonRow() {
  return (
    <tr className="skeleton-row">
      <td><div className="skeleton w-60" /></td>
      <td><div className="skeleton w-60" /></td>
      <td><div className="skeleton w-40" /></td>
      <td><div className="skeleton w-30" /></td>
      <td>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="skeleton circle" />
          <div className="skeleton circle" />
          <div className="skeleton circle" />
        </div>
      </td>
    </tr>
  );
}

export default SkeletonRow;
