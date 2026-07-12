// =====================================================================
// ComplaintForm — the public, mobile-first page opened by scanning the
// office QR code. No login required. Collects name (required), mobile
// (optional), and a required photo of the issue.
// =====================================================================
import React, { useRef, useState } from 'react';
import api from '../api/axios';

function ComplaintForm() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState(null); // holds { id } after success
  const fileInputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!image) {
      setError('Please attach a photo of the issue.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    if (mobile.trim()) formData.append('mobile_number', mobile.trim());
    formData.append('image', image);

    try {
      setSubmitting(true);
      const res = await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setTicket({ id: res.data.complaintId });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setName('');
    setMobile('');
    setImage(null);
    setPreview(null);
    setTicket(null);
    setError('');
  }

  // ---------------------- Success state ----------------------
  if (ticket) {
    return (
      <div className="min-h-screen bg-ink-900 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="ticket-notch bg-paper rounded-2xl shadow-ticket px-6 pt-8 pb-6 text-center border-t-8 border-amber-400">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="#2f855a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="font-display text-xl font-bold text-ink-900">
              Your complaint has been submitted successfully.
            </h1>
            <p className="mt-2 text-sm text-ink-500">
              The office team has been notified and will review it shortly.
            </p>

            <div className="my-6 border-t border-dashed border-ink-200" />

            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-400">Ticket No.</span>
              <span className="font-display font-bold text-ink-800">
                #{String(ticket.id).padStart(5, '0')}
              </span>
            </div>

            <button
              onClick={resetForm}
              className="mt-6 w-full rounded-lg bg-ink-800 py-3 text-sm font-semibold text-white transition hover:bg-ink-700"
            >
              Submit another complaint
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------- Form state ----------------------
  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 5h16M4 12h16M4 19h10"
                stroke="#1e2c47"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1 className="font-display text-lg font-bold text-white">Govt Cocoon Market Ramnagar Complaint Portal</h1>
          <p className="mt-1 text-sm text-ink-300">Report an issue in a few seconds.</p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="bg-paper rounded-2xl shadow-ticket p-6 space-y-5"
        >
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-ink-800 mb-1.5">
              Name <span className="text-amber-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder-ink-300 focus:border-amber-400 focus:ring-0"
              required
            />
          </div>

          <div>
            <label htmlFor="mobile" className="block text-sm font-semibold text-ink-800 mb-1.5">
              Mobile Number <span className="text-ink-300 font-normal">(optional)</span>
            </label>
            <input
              id="mobile"
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="e.g. 98765 43210"
              className="w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder-ink-300 focus:border-amber-400 focus:ring-0"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-800 mb-1.5">
              Photo of the Issue <span className="text-amber-500">*</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
              id="image-upload"
            />

            {preview ? (
              <div
                className="relative rounded-lg overflow-hidden border border-ink-200 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <img src={preview} alt="Complaint preview" className="w-full h-44 object-cover" />
                <div className="absolute inset-0 bg-ink-900/40 opacity-0 hover:opacity-100 transition flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">Tap to change photo</span>
                </div>
              </div>
            ) : (
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ink-200 bg-white py-8 text-ink-400 cursor-pointer transition hover:border-amber-300 hover:text-amber-500"
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 16.5V18a2 2 0 002 2h12a2 2 0 002-2v-1.5M7 9l5-5 5 5M12 4v13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-xs font-semibold">Tap to take or upload a photo</span>
              </label>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-amber-400 py-3 text-sm font-bold text-ink-900 transition hover:bg-amber-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting…' : 'Submit Complaint'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-ink-400">
          Your complaint is routed directly to the office administration team.
        </p>
      </div>
    </div>
  );
}

export default ComplaintForm;
