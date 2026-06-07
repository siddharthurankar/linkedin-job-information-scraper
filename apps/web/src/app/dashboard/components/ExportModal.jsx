"use client";

import { useState } from "react";
import { X, Download, FileText, Code2, Table, Tag } from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function escCell(v) {
  return `"${String(v ?? "")
    .replace(/"/g, '""')
    .replace(/\r?\n/g, " ")}"`;
}

function buildRows(jobs, opts) {
  const { includeKeywords, includeAI, includeDesc, includeMeta } = opts;

  const headers = [
    "Title",
    "Company",
    "Location",
    "Workplace",
    "Easy Apply",
    "Job URL",
    "Collection",
  ];
  if (includeKeywords) headers.push("Top 10 Keywords");
  if (includeAI)
    headers.push("AI Score", "Experience Level", "Role Category", "AI Tags");
  if (includeDesc) headers.push("Full Job Description");
  if (includeMeta) headers.push("Scraped At", "Source Page");

  const rows = jobs.map((j) => {
    const row = [
      j.title || "",
      j.company || "",
      j.location || "",
      j.workplaceType || "",
      j.easyApply ? "Yes" : "No",
      j.jobUrl || "",
      j.collection || "",
    ];
    if (includeKeywords) row.push((j.keywords || []).join(", "));
    if (includeAI) {
      row.push(
        j.aiAnalysis?.matchScore ?? "",
        j.aiAnalysis?.experienceLevel ?? "",
        j.aiAnalysis?.roleCategory ?? "",
        (j.aiAnalysis?.tags || []).join(", "),
      );
    }
    if (includeDesc) row.push(j.description || "");
    if (includeMeta) {
      row.push(
        j.metadata?.scrapedAt
          ? new Date(Number(j.metadata.scrapedAt)).toLocaleString()
          : "",
        j.metadata?.sourcePage || "",
      );
    }
    return row;
  });

  return { headers, rows };
}

function toCSV(jobs, opts) {
  const { headers, rows } = buildRows(jobs, opts);
  const lines = [
    headers.map(escCell).join(","),
    ...rows.map((r) => r.map(escCell).join(",")),
  ];
  return "\uFEFF" + lines.join("\r\n"); // UTF-8 BOM so Excel opens correctly
}

function toJSON(jobs, opts) {
  const { includeKeywords, includeAI, includeDesc, includeMeta } = opts;
  return JSON.stringify(
    jobs.map((j) => {
      const obj = {
        title: j.title,
        company: j.company,
        location: j.location,
        workplaceType: j.workplaceType,
        easyApply: j.easyApply,
        jobUrl: j.jobUrl,
        collection: j.collection,
      };
      if (includeKeywords) obj.keywords = j.keywords || [];
      if (includeAI) obj.aiAnalysis = j.aiAnalysis;
      if (includeDesc) obj.description = j.description;
      if (includeMeta) obj.metadata = j.metadata;
      return obj;
    }),
    null,
    2,
  );
}

async function toXLSX(jobs, opts) {
  const mod = await import("xlsx");
  const XLSX = mod.default || mod;
  const { headers, rows } = buildRows(jobs, opts);
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  // Auto column widths (cap at 80)
  ws["!cols"] = headers.map((h, i) => ({
    wch: Math.min(
      80,
      Math.max(
        h.length + 4,
        ...rows.slice(0, 30).map((r) => String(r[i] || "").length),
      ),
    ),
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "LinkedIn Jobs");
  return XLSX.write(wb, { type: "array", bookType: "xlsx" });
}

function dl(content, filename, type) {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), {
    href: url,
    download: filename,
  });
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 300);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExportModal({ jobs, onClose }) {
  const [format, setFormat] = useState("csv");
  const [opts, setOpts] = useState({
    includeKeywords: true,
    includeAI: true,
    includeDesc: true,
    includeMeta: false,
  });
  const [status, setStatus] = useState(null);
  const [errMsg, setErrMsg] = useState(null);

  const toggle = (k) => setOpts((prev) => ({ ...prev, [k]: !prev[k] }));
  const ts = () => new Date().toISOString().slice(0, 10);

  const handleExport = async () => {
    setStatus("exporting");
    setErrMsg(null);
    try {
      if (format === "csv") {
        dl(
          toCSV(jobs, opts),
          `linkedin-jobs-${ts()}.csv`,
          "text/csv;charset=utf-8",
        );
      } else if (format === "json") {
        dl(
          toJSON(jobs, opts),
          `linkedin-jobs-${ts()}.json`,
          "application/json",
        );
      } else {
        try {
          const data = await toXLSX(jobs, opts);
          dl(
            data,
            `linkedin-jobs-${ts()}.xlsx`,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          );
        } catch {
          // Fallback to CSV if xlsx isn't available
          dl(
            toCSV(jobs, opts),
            `linkedin-jobs-${ts()}.csv`,
            "text/csv;charset=utf-8",
          );
        }
      }
      setStatus("done");
      setTimeout(onClose, 900);
    } catch (e) {
      console.error("Export error:", e);
      setErrMsg(e.message);
      setStatus("error");
    }
  };

  const formats = [
    { id: "csv", label: "CSV", sub: "Excel & Google Sheets", Icon: Table },
    { id: "xlsx", label: "Excel", sub: "Native .xlsx format", Icon: FileText },
    { id: "json", label: "JSON", sub: "For developers", Icon: Code2 },
  ];

  const optRows = [
    {
      key: "includeKeywords",
      label: "Top 10 keywords per job",
      sub: "The critical keywords from each job description",
      highlight: true,
    },
    {
      key: "includeAI",
      label: "AI analysis columns",
      sub: "Score, experience level, role category, tags",
    },
    {
      key: "includeDesc",
      label: "Full job description",
      sub: "Complete text including Show more sections",
    },
    {
      key: "includeMeta",
      label: "Metadata",
      sub: "Scraped date and source URL",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Export Jobs</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {jobs.length} job{jobs.length !== 1 ? "s" : ""} to export
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Format */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Format
            </p>
            <div className="grid grid-cols-3 gap-2">
              {formats.map(({ id, label, sub, Icon }) => (
                <button
                  key={id}
                  onClick={() => setFormat(id)}
                  className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border text-center transition-all ${format === id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
                >
                  <Icon
                    size={18}
                    className={
                      format === id ? "text-blue-600" : "text-gray-400"
                    }
                  />
                  <div
                    className={`text-sm font-bold ${format === id ? "text-blue-700" : "text-gray-700"}`}
                  >
                    {label}
                  </div>
                  <div className="text-[10px] text-gray-400 leading-tight">
                    {sub}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Columns */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Columns to Include
            </p>
            <div className="space-y-1.5">
              {optRows.map(({ key, label, sub, highlight }) => (
                <label
                  key={key}
                  className={`flex items-start gap-3 cursor-pointer p-2.5 rounded-xl transition-colors ${opts[key] && highlight ? "bg-amber-50 border border-amber-100" : "hover:bg-gray-50"}`}
                >
                  <input
                    type="checkbox"
                    checked={opts[key]}
                    onChange={() => toggle(key)}
                    className="rounded border-gray-300 text-blue-600 w-4 h-4 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <div
                      className={`text-sm font-semibold flex items-center gap-1.5 ${highlight ? "text-amber-800" : "text-gray-800"}`}
                    >
                      {highlight && (
                        <Tag size={11} className="text-amber-500" />
                      )}
                      {label}
                    </div>
                    <div className="text-xs text-gray-400">{sub}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {errMsg && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {errMsg}
            </div>
          )}
          {status === "done" && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium">
              ✓ Download started!
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={status === "exporting" || jobs.length === 0}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Download size={15} />
            {status === "exporting"
              ? "Exporting…"
              : `Export ${jobs.length} jobs`}
          </button>
        </div>
      </div>
    </div>
  );
}
