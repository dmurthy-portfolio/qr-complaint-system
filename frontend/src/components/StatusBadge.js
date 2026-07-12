// =====================================================================
// StatusBadge — small pill showing complaint status with a matching color.
// =====================================================================
import React from 'react';

const STYLES = {
  Pending: 'bg-amber-100 text-amber-600 border-amber-200',
  'In Progress': 'bg-ink-100 text-ink-700 border-ink-200',
  Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

function StatusBadge({ status }) {
  const style = STYLES[status] || 'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export default StatusBadge;
