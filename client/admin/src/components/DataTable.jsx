import './DataTable.css';

/**
 * @param {{key: string, label: string, render?: (row: any) => React.ReactNode, width?: string}[]} columns
 */
export default function DataTable({ columns, rows, isLoading, error, emptyMessage = 'No records found.' }) {
  if (isLoading) {
    return <div className="table-state">Loading…</div>;
  }
  if (error) {
    return <div className="table-state table-state-error">{error}</div>;
  }
  if (!rows || rows.length === 0) {
    return <div className="table-state">{emptyMessage}</div>;
  }

  return (
    <div className="scroll-x">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={col.width ? { width: col.width } : undefined}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
