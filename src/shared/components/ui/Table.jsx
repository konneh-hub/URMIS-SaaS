import React from 'react';

/**
 * @typedef {{
 *   header: string;
 *   accessor: string;
 *   render?: (value: any, row: Record<string, any>) => React.ReactNode;
 *   className?: string;
 * }} TableColumn
 */

/**
 * @param {{ columns?: TableColumn[]; rows?: Array<Record<string, any>>; emptyText?: string; }} props
 */
export default function Table({ columns = [], rows = [], emptyText = 'No records available.' }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
      <table className="min-w-full divide-y divide-[var(--color-border)] text-sm">
        <thead className="bg-[var(--color-background)]">
          <tr>
            {columns.map((column) => (
              <th key={column.accessor} className={`px-4 py-3 text-left font-semibold text-[var(--color-text)] ${column.className || ''}`.trim()}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)] bg-white">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-[var(--color-muted-text)]">
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-[var(--color-muted)]">
                {columns.map((column) => {
                  const value = row[column.accessor];
                  const content = column.render ? column.render(value, row) : value;
                  return (
                    <td key={`${rowIndex}-${column.accessor}`} className={`px-4 py-3 align-top text-[var(--color-text)] ${column.className || ''}`.trim()}>
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
