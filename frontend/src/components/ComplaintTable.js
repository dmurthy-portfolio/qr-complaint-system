// =====================================================================
// ComplaintTable
// Enhanced Version
// =====================================================================

import React, { useEffect, useState } from "react";
import api from "../api/axios";
import StatusBadge from "./StatusBadge";
import { useLanguage } from "../context/LanguageContext";

const STATUS_OPTIONS = [
  "Pending",
  "In Progress",
  "Resolved",
];

function formatDate(iso) {
  const d = new Date(iso);

  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ComplaintTable({
  complaints,
  onStatusChange,
  onDelete,
  onDownload,
  loading,
}) {
  const { t } = useLanguage();

  const [lightboxImage, setLightboxImage] = useState(null);

  const [selectedComplaint, setSelectedComplaint] =
    useState(null);

  const [remark, setRemark] = useState("");

  const [savingRemark, setSavingRemark] =
    useState(false);

  useEffect(() => {
    if (selectedComplaint) {
      setRemark(
        selectedComplaint.admin_remark || ""
      );
    }
  }, [selectedComplaint]);

  // ==========================
  // Loading
  // ==========================

  if (loading) {
    return (
      <div className="py-16 text-center text-ink-400">
        {t.loadingComplaints ||
          "Loading complaints..."}
      </div>
    );
  }

  // ==========================
  // Empty State
  // ==========================

  if (!complaints.length) {
    return (
      <div className="py-16 text-center">

        <p className="font-semibold text-ink-600">
          {t.noComplaints}
        </p>

        <p className="mt-2 text-sm text-ink-400">
          {t.tryDifferentSearch}
        </p>

      </div>
    );
  }

  // ==========================
  // Save Admin Remark
  // ==========================

  async function saveRemark() {

    if (!selectedComplaint) return;

    try {

      setSavingRemark(true);

      await api.patch(

        `/complaints/${selectedComplaint.id}/remark`,

        {
          admin_remark: remark,
        }

      );

      setSelectedComplaint((prev) => ({
        ...prev,
        admin_remark: remark,
      }));

      alert(
        t.remarkSaved ||
          "Remark saved successfully."
      );

    } catch (err) {

      alert(
        t.remarkSaveFailed ||
          "Unable to save remark."
      );

    } finally {

      setSavingRemark(false);

    }

  }

  // ==========================
  // UI Starts Here
  // Part 2 continues...
  // ==========================

  return (
    <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">

        <table className="min-w-full divide-y divide-gray-200 text-sm">

          {/* ================= Table Header ================= */}

          <thead className="bg-gray-50">

            <tr>

              <th className="px-4 py-3 text-left font-semibold">
                {t.ticket}
              </th>

              <th className="px-4 py-3 text-left font-semibold">
                {t.photo}
              </th>

              <th className="px-4 py-3 text-left font-semibold">
                {t.name}
              </th>

              <th className="px-4 py-3 text-left font-semibold">
                {t.mobile}
              </th>

              <th className="px-4 py-3 text-left font-semibold">
                {t.submittedOn}
              </th>

              <th className="px-4 py-3 text-left font-semibold">
                {t.status}
              </th>

              <th className="px-4 py-3 text-right font-semibold">
                {t.actions}
              </th>

            </tr>

          </thead>

          {/* ================= Table Body ================= */}

          <tbody className="divide-y divide-gray-100">

            {complaints.map((c) => (

              <tr
                key={c.id}
                className="hover:bg-gray-50 transition"
              >

                {/* Ticket */}

                <td className="px-4 py-3 font-bold">
                  #{String(c.id).padStart(5, "0")}
                </td>

                {/* Photo */}

                <td className="px-4 py-3">

                  <button
                    onClick={() =>
                      setLightboxImage(c.image_path)
                    }
                  >

                    <img
                      src={c.image_path}
                      alt={c.name}
                      className="h-14 w-14 rounded-lg border object-cover hover:opacity-80 transition"
                    />

                  </button>

                </td>

                {/* Name */}

                <td className="px-4 py-3">
                  {c.name}
                </td>

                {/* Mobile */}

                <td className="px-4 py-3">
                  {c.mobile_number || "—"}
                </td>

                {/* Date */}

                <td className="px-4 py-3 whitespace-nowrap">
                  {formatDate(c.created_at)}
                </td>

                {/* Status */}

                <td className="px-4 py-3">

                  <select
                    value={c.status}
                    onChange={(e) =>
                      onStatusChange(
                        c.id,
                        e.target.value
                      )
                    }
                    className="rounded-lg border px-2 py-1 text-sm"
                  >

                    {STATUS_OPTIONS.map((status) => (

                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>

                    ))}

                  </select>

                  <div className="mt-2">
                    <StatusBadge status={c.status} />
                  </div>

                </td>

                {/* Actions */}

                <td className="px-4 py-3">

                  <div className="flex justify-end gap-2">

                    {/* View */}

                    <button
                      onClick={() =>
                        setSelectedComplaint(c)
                      }
                      title={t.view}
                      className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100"
                    >
                      {t.view}
                    </button>

                    {/* Download */}

                    <button
                      onClick={() =>
                        onDownload(c.id)
                      }
                      title={t.download}
                      className="rounded-lg p-2 hover:bg-gray-100"
                    >

                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M12 3v13m0 0l-4-4m4 4l4-4M5 21h14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                    </button>

                    {/* Delete */}

                    <button
                      onClick={() =>
                        onDelete(c.id)
                      }
                      title={t.delete}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                    >

                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0v13a2 2 0 01-2 2H8a2 2 0 01-2-2V7"
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

          )
          {/* =================
          Complaint Modal
          Part 3 starts here
      ================= */}
            {/* ================= DESCRIPTION MODAL ================= */}

      {selectedComplaint && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedComplaint(null)}
        >

          <div
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Header */}

            <div className="flex items-center justify-between border-b px-6 py-4">

              <h2 className="text-xl font-bold text-gray-800">
                {t.complaintDetails}
              </h2>

              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-2xl text-gray-500 hover:text-red-500"
              >
                ×
              </button>

            </div>

            {/* Body */}

            <div className="space-y-5 p-6">

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <p className="text-xs uppercase text-gray-500">
                    {t.ticket}
                  </p>

                  <p className="font-semibold">
                    #{String(selectedComplaint.id).padStart(5, "0")}
                  </p>

                </div>

                <div>

                  <p className="text-xs uppercase text-gray-500">
                    {t.status}
                  </p>

                  <StatusBadge
                    status={selectedComplaint.status}
                  />

                </div>

                <div>

                  <p className="text-xs uppercase text-gray-500">
                    {t.name}
                  </p>

                  <p className="font-medium">
                    {selectedComplaint.name}
                  </p>

                </div>

                <div>

                  <p className="text-xs uppercase text-gray-500">
                    {t.mobile}
                  </p>

                  <p>
                    {selectedComplaint.mobile_number || t.notProvided}
                  </p>

                </div>

                <div className="col-span-2">

                  <p className="text-xs uppercase text-gray-500">
                    {t.submittedOn}
                  </p>

                  <p>
                    {formatDate(selectedComplaint.created_at)}
                  </p>

                </div>

              </div>

              {/* Complaint Image */}

              <div>

                <p className="mb-2 text-xs uppercase text-gray-500">
                  {t.complaintImage}
                </p>

                <img
                  src={selectedComplaint.image_path}
                  alt="Complaint"
                  className="max-h-72 rounded-xl border"
                />

              </div>

              {/* Description */}

              <div>

                <p className="mb-2 text-xs uppercase text-gray-500">
                  {t.description}
                </p>

                <div className="rounded-xl border bg-gray-50 p-4 leading-7 whitespace-pre-wrap">

                  {selectedComplaint.description ? (

                    selectedComplaint.description

                  ) : (

                    <span className="italic text-gray-400">
                      {t.noDescription}
                    </span>

                  )}

                </div>

              </div>

              {/* Admin Remark */}

              <div className="mt-6">

                <p className="mb-2 text-xs uppercase text-gray-500">
                  {t.adminRemark}
                </p>

                <textarea
                  rows={4}
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder={t.writeRemark}
                  className="w-full rounded-xl border p-3 focus:border-blue-500 focus:outline-none"
                />

              </div>

            </div>

            {/* Footer */}

            <div className="flex justify-between border-t px-6 py-4">

              <button
                onClick={() => setSelectedComplaint(null)}
                className="rounded-lg border px-5 py-2"
              >
                {t.close}
              </button>

              <button
                onClick={saveRemark}
                disabled={savingRemark}
                className="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700 disabled:opacity-50"
              >

                {savingRemark
                  ? t.saving
                  : t.saveRemark}

              </button>

            </div>

          </div>

        </div>

      )}

      {/* =================
          Image Lightbox
          Part 4 starts here
      ================= */}
            {/* ================= IMAGE LIGHTBOX ================= */}

      {lightboxImage && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={() => setLightboxImage(null)}
        >

          <img
            src={lightboxImage}
            alt={t.complaintImage}
            className="max-h-[90vh] max-w-full rounded-2xl shadow-2xl"
          />

        </div>

      )}

    </>

  );

}

export default ComplaintTable;