import React, { useState } from "react";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import { useLanguage } from "../context/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";

function formatDate(date) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ComplaintStatus() {
  const { t } = useLanguage();

  const [complaintId, setComplaintId] = useState("");
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e) {
    e.preventDefault();

    if (!complaintId.trim()) {
      setError(t.enterComplaintId || "Please enter a Complaint ID.");
      setComplaint(null);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.get(`/complaints/public/${complaintId}`);

      setComplaint(res.data.data);
    } catch (err) {
      setComplaint(null);
      setError(
        err.response?.data?.message ||
          (t.complaintNotFound || "Complaint not found.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-10 px-4">

      <div className="absolute top-5 right-5">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-center text-blue-700">
          {t.complaintTracker}
        </h1>

        <p className="text-center text-gray-500 mt-2">
          {t.trackInstruction || "Enter your Complaint ID to check the latest status."}
        </p>

        <form
          onSubmit={handleSearch}
          className="mt-8 flex gap-3"
        >

          <input
            type="number"
            placeholder={t.complaintId}
            value={complaintId}
            onChange={(e) => setComplaintId(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            {loading ? t.loading : t.checkStatus}
          </button>

        </form>

        {error && (

          <div className="mt-5 rounded-lg bg-red-100 text-red-700 p-3">
            {error}
          </div>

        )}

        {/* =========================================================
            Complaint Details
            Part 2 continues from here...
        ========================================================= */}
                {complaint && (

          <div className="mt-8 border rounded-xl p-6">

            <div className="flex justify-between items-center">

              <div>

                <h2 className="text-2xl font-bold">
                  {t.complaintId} #{complaint.id}
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  {t.submittedOn} {formatDate(complaint.created_at)}
                </p>

              </div>

              <StatusBadge status={complaint.status} />

            </div>

            

            {/* Description */}

            <div className="mt-6">

              <h3 className="font-semibold text-gray-700 mb-2">
                {t.description}
              </h3>

              <div className="rounded-lg border bg-gray-50 p-4 whitespace-pre-wrap">

                {complaint.description || t.noDescription}

              </div>

            </div>

            {/* Admin Remark */}

            <div className="mt-6">

              <h3 className="font-semibold text-gray-700 mb-2">
                {t.adminRemark}
              </h3>

              <div className="rounded-lg border bg-blue-50 p-4 whitespace-pre-wrap">

                {complaint.admin_remark || t.noRemark}

              </div>

            </div>

            {/* Complaint Image */}

            <div className="mt-6">

              <h3 className="font-semibold text-gray-700 mb-2">
                {t.complaintImage}
              </h3>

              {complaint.image_path ? (

                <img
                  src={complaint.image_path}
                  alt={t.complaintImage}
                  className="rounded-xl border max-h-96"
                />

              ) : (

                <div className="rounded-lg border bg-gray-50 p-4 text-gray-500">
                  No image available.
                </div>

              )}

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

export default ComplaintStatus;
