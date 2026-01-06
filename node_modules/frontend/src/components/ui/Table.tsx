import React from 'react';

interface TableProps {
  columns: { key: string; label: string; width?: string }[];
  data: Record<string, any>[];
  onRowClick?: (row: Record<string, any>) => void;
  actions?: (row: Record<string, any>) => React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ columns, data, onRowClick, actions }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-4 font-bold text-gray-900"
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
            {actions && <th className="px-6 py-4 font-bold text-gray-900">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-8">
                <p className="text-gray-500">No data available</p>
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-gray-200 ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-gray-700">
                    {row[col.key]}
                  </td>
                ))}
                {actions && <td className="px-6 py-4">{actions(row)}</td>}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
