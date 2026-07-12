// =====================================================================
// AdminDashboard — the protected admin view. Lists complaints with
// search + status filter, lets the admin change status, download
// images, delete complaints, and view the QR code for the office.
// =====================================================================
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ComplaintTable from '../components/ComplaintTable';

const STATUS_TABS = ['All', 'Pending', 'In Progress', 'Resolved'];

function AdminDashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [showQR, setShowQR] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [toast, setToast] = useState('');

  const username = localStorage.getItem('admin_username');

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints', {
        params: {
          search: search || undefined,
          status: statusFilter !== 'All' ? statusFilter : undefined,
          page,
          limit: 10,
        },
      });
      setComplaints(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to fetch complaints', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(''), 2500);
  }

  async function handleStatusChange(id, status) {
    // Optimistic UI update
    setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    try {
      await api.patch(`/complaints/${id}/status`, { status });
      showToast('Status updated.');
    } catch (err) {
      showToast('Failed to update status.');
      fetchComplaints(); // revert on failure
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this complaint permanently? This cannot be undone.')) return;
    try {
      await api.delete(`/complaints/${id}`);
      showToast('Complaint deleted.');
      fetchComplaints();
    } catch (err) {
      showToast('Failed to delete complaint.');
    }
  }

  async function handleDownload(id) {
    try {
      const res = await api.get(`/complaints/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `complaint-${id}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      showToast('Failed to download image.');
    }
  }

  async function handleShowQR() {
    setShowQR(true);
    if (!qrCode) {
      try {
        const res = await api.get('/qrcode');
        setQrCode(res.data.qrCode);
      } catch (err) {
        showToast('Failed to load QR code.');
      }
    }
  }

  function handleLogout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    navigate('/admin/login');
  }

  // Quick stat counts derived from current filtered total isn't accurate across pages,
  // so we fetch a lightweight summary using status filters when "All" tab is active.
  const [summary, setSummary] = useState(null);
  useEffect(() => {
    async function loadSummary() {
      try {
        const [pending, inProgress, resolved] = await Promise.all([
          api.get('/complaints', { params: { status: 'Pending', limit: 1 } }),
          api.get('/complaints', { params: { status: 'In Progress', limit: 1 } }),
          api.get('/complaints', { params: { status: 'Resolved', limit: 1 } }),
        ]);
        setSummary({
          pending: pending.data.pagination.total,
          inProgress: inProgress.data.pagination.total,
          resolved: resolved.data.pagination.total,
        });
      } catch (err) {
        // Non-critical — silently ignore
      }
    }
    loadSummary();
  }, [complaints]);

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Top bar */}
      <header className="bg-ink-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 5h16M4 12h16M4 19h10" stroke="#1e2c47" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-base font-bold leading-tight">Complaint Desk</h1>
              <p className="text-xs text-ink-300">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShowQR}
              className="rounded-lg border border-ink-600 px-3 py-2 text-xs font-semibold text-ink-100 hover:bg-ink-800 transition"
            >
              Show QR Code
            </button>
            <span className="hidden sm:inline text-xs text-ink-300">{username}</span>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-amber-400 px-3 py-2 text-xs font-bold text-ink-900 hover:bg-amber-300 transition"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl bg-white border border-ink-100 p-4">
            <p className="text-xs font-semibold text-ink-400">Pending</p>
            <p className="mt-1 font-display text-2xl font-bold text-amber-500">
              {summary ? summary.pending : '—'}
            </p>
          </div>
          <div className="rounded-xl bg-white border border-ink-100 p-4">
            <p className="text-xs font-semibold text-ink-400">In Progress</p>
            <p className="mt-1 font-display text-2xl font-bold text-ink-700">
              {summary ? summary.inProgress : '—'}
            </p>
          </div>
          <div className="rounded-xl bg-white border border-ink-100 p-4">
            <p className="text-xs font-semibold text-ink-400">Resolved</p>
            <p className="mt-1 font-display text-2xl font-bold text-emerald-600">
              {summary ? summary.resolved : '—'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex gap-1.5 overflow-x-auto">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setStatusFilter(tab);
                  setPage(1);
                }}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  statusFilter === tab
                    ? 'bg-ink-800 text-white'
                    : 'bg-white text-ink-500 border border-ink-200 hover:bg-ink-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300"
            >
              <path
                d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, mobile, or ticket #"
              className="w-full rounded-lg border border-ink-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-amber-400 focus:ring-0"
            />
          </div>
        </div>

        {/* Table */}
        <ComplaintTable
          complaints={complaints}
          loading={loading}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onDownload={handleDownload}
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm text-ink-500">
            <span>
              Page {page} of {pagination.totalPages} • {pagination.total} total
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                disabled={page === pagination.totalPages}
                className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      {/* QR Code modal */}
      {showQR && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/70 p-4"
          onClick={() => setShowQR(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-xs w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display font-bold text-ink-800 mb-3">Scan to Report an Issue</h2>
            {qrCode ? (
              <img src={qrCode} alt="QR code linking to the complaint form" className="mx-auto rounded-lg" />
            ) : (
              <div className="h-48 flex items-center justify-center text-ink-300 text-sm">
                Loading…
              </div>
            )}
            <p className="mt-3 text-xs text-ink-400">
              Print and place this QR code around the office.
            </p>
            <button
              onClick={() => setShowQR(false)}
              className="mt-4 w-full rounded-lg bg-ink-800 py-2.5 text-sm font-semibold text-white hover:bg-ink-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-ink-900 text-white text-sm px-4 py-2.5 shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
