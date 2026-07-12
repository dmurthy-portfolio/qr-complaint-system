// =====================================================================
// ComplaintTable — renders the list of complaints with inline status
// change, image preview, download, and delete actions.
// =====================================================================
import React, { useState } from 'react';
import StatusBadge from './StatusBadge';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Resolved'];
const IMAGE_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(
  '/api',
  ''
);

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ComplaintTable({ complaints, onStatusChange, onDelete, onDownload, loading }) {
  const [lightboxImage, setLightboxImage] = useState(null);

  if (loading) {
    return (
      <div className="py-16 text-center text-ink-400 text-sm">Loading complaints…</div>
    );
  }

  if (!complaints.length) {
    return (
      <div className="py-16 text-center">
        <p className="text-ink-500 font-medium">No complaints found.</p>
        <p className="text-ink-300 text-sm mt-1">Try adjusting your search or filter.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-ink-100">
        <table className="min-w-full divide-y divide-ink-100 text-sm">
          <thead className="bg-ink-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-ink-600">Ticket</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-600">Photo</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-600">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-600">Mobile</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-600">Submitted</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-600">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-ink-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100 bg-white">
            {complaints.map((c) => (
              <tr key={c.id} className="hover:bg-ink-50/50 transition">
                <td className="px-4 py-3 font-display font-bold text-ink-800">
                  #{String(c.id).padStart(5, '0')}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setLightboxImage(`${IMAGE_BASE_URL}${c.image_path}`)}>
                    <img
                      src={`${IMAGE_BASE_URL}${c.image_path}`}
                      alt={`Complaint by ${c.name}`}
                      className="h-12 w-12 rounded-lg object-cover border border-ink-100 hover:opacity-80 transition"
                    />
                  </button>
                </td>
                <td className="px-4 py-3 text-ink-800">{c.name}</td>
                <td className="px-4 py-3 text-ink-500">{c.mobile_number || '—'}</td>
                <td className="px-4 py-3 text-ink-500 whitespace-nowrap">
                  {formatDate(c.created_at)}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={c.status}
                    onChange={(e) => onStatusChange(c.id, e.target.value)}
                    className="rounded-lg border border-ink-200 bg-white px-2 py-1.5 text-xs font-semibold text-ink-700 focus:border-amber-400 focus:ring-0"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <div className="mt-1.5">
                    <StatusBadge status={c.status} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onDownload(c.id)}
                      title="Download image"
                      className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 hover:text-ink-800 transition"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M4 16.5V18a2 2 0 002 2h12a2 2 0 002-2v-1.5M12 4v13m0 0l-4-4m4 4l4-4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(c.id)}
                      title="Delete complaint"
                      className="rounded-lg p-2 text-ink-500 hover:bg-red-50 hover:text-red-600 transition"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0v13a2 2 0 01-2 2H8a2 2 0 01-2-2V7h12z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Lightbox for full-size image preview */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/80 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <img
            src={lightboxImage}
            alt="Complaint full size"
            className="max-h-[85vh] max-w-full rounded-xl shadow-2xl"
          />
        </div>
      )}
    </>
  );
}

export default ComplaintTable;
