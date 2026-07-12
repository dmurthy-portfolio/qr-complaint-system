// =====================================================================
// AdminLogin — secure login page for office administrators.
// =====================================================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { username, password });
      localStorage.setItem('admin_token', res.data.token);
      localStorage.setItem('admin_username', res.data.admin.username);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zM8 11V7a4 4 0 118 0v4"
                stroke="#1e2c47"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="font-display text-lg font-bold text-white">Admin Sign In</h1>
          <p className="mt-1 text-sm text-ink-300">Sericulture Department Complaint Portal dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-paper rounded-2xl shadow-ticket p-6 space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-ink-800 mb-1.5">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm focus:border-amber-400 focus:ring-0"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-ink-800 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm focus:border-amber-400 focus:ring-0"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-ink-800 py-3 text-sm font-bold text-white transition hover:bg-ink-700 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
