"use client";

import { useJobStore } from "@/app/dashboard/store";
import { useEffect, useRef, useState } from "react";
import { Trash2, Shield, Home, Key, FileText, Sparkles } from "lucide-react";
import { extractResumeText } from "@/app/dashboard/utils/resume";
import { canScore } from "@/app/dashboard/utils/scoreDisplay";

export default function SettingsTab() {
  const { settings, updateSettings, loadSettings, clearAllJobs, jobs } =
    useJobStore();
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleClearAll = async () => {
    if (confirm(`Delete all ${jobs.length} jobs? This cannot be undone.`)) {
      await clearAllJobs();
    }
  };

  const handleResumeFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeUploading(true);
    setResumeError("");
    try {
      const text = await extractResumeText(file);
      updateSettings({ resumeText: text });
    } catch (err) {
      setResumeError(err.message);
    } finally {
      setResumeUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const resumeChars = (settings.resumeText || "").length;
  const ready = canScore(settings);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="text-2xl">📌</div>
          <div>
            <h3 className="text-sm font-bold text-blue-900 mb-1">
              How to scrape new jobs
            </h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>
                Go to <strong>LinkedIn Jobs</strong> in your browser
              </li>
              <li>
                Click <strong>"Scrape LinkedIn Jobs"</strong> in your bookmarks
                bar
              </li>
              <li>
                Click <strong>Start Scraping</strong> in the panel that appears
              </li>
              <li>
                When done, click <strong>Save to Dashboard</strong>
              </li>
            </ol>
            <a
              href="/"
              className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors"
            >
              <Home size={12} />
              Setup instructions →
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} className="text-violet-600" />
          <h2 className="text-base font-bold text-gray-900">
            Resume match scoring (Gemini)
          </h2>
        </div>
        <p className="text-xs text-gray-500 mb-5">
          Score jobs against <em>your</em> resume using your own Google Gemini
          API key. Requests go directly from your browser to Google — your key
          and resume never pass through this app&apos;s server. Keywords on each
          job still work without AI.
        </p>

        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
              <Key size={14} />
              Google Gemini API key
            </label>
            <input
              type="password"
              autoComplete="off"
              placeholder="AIza…"
              value={settings.geminiApiKey || ""}
              onChange={(e) =>
                updateSettings({ geminiApiKey: e.target.value.trim() })
              }
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Stored only in this browser (
              <code className="text-[10px]">localStorage</code>). Create a key
              in{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-600 underline"
              >
                Google AI Studio
              </a>
              .
            </p>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
              <FileText size={14} />
              Your resume
            </label>
            <textarea
              value={settings.resumeText || ""}
              onChange={(e) => updateSettings({ resumeText: e.target.value })}
              placeholder="Paste resume text here…"
              rows={8}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <input
                ref={fileRef}
                type="file"
                accept=".txt,.pdf,text/plain,application/pdf"
                className="hidden"
                onChange={handleResumeFile}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={resumeUploading}
                className="text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded-lg px-3 py-1.5 hover:bg-violet-100 disabled:opacity-50"
              >
                {resumeUploading ? "Reading file…" : "Upload .txt or .pdf"}
              </button>
              {resumeChars > 0 && (
                <span className="text-xs text-gray-400">
                  {resumeChars.toLocaleString()} characters
                </span>
              )}
            </div>
            {resumeError && (
              <p className="text-xs text-red-600 mt-2">{resumeError}</p>
            )}
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={!!settings.geminiScoringEnabled}
              onChange={(e) =>
                updateSettings({ geminiScoringEnabled: e.target.checked })
              }
              className="rounded border-gray-300 text-violet-600"
            />
            <span className="text-sm text-gray-700">
              Enable match scoring in the Jobs tab
            </span>
          </label>

          <div
            className={`rounded-xl px-4 py-3 text-sm ${ready ? "bg-green-50 border border-green-200 text-green-800" : "bg-amber-50 border border-amber-200 text-amber-800"}`}
          >
            {ready
              ? "Ready — open Jobs and use Score on each row, or Score all unscored."
              : "Add both an API key and resume text to score jobs."}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">
          Export Preferences
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default export format
            </label>
            <select
              value={settings.preferredExportFormat || "csv"}
              onChange={(e) =>
                updateSettings({ preferredExportFormat: e.target.value })
              }
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none
                    focus:ring-2 focus:ring-blue-500"
            >
              <option value="csv">CSV — best for Excel</option>
              <option value="json">JSON — best for developers</option>
              <option value="xlsx">Excel (XLSX)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">
          Privacy & Storage
        </h2>
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
          <Shield size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-green-900 mb-1">
              Jobs in your database; keys stay local
            </div>
            <p className="text-xs text-green-700">
              Scraped jobs are stored in your database. Your Gemini API key and
              resume text stay in this browser only. Gemini scoring calls Google
              directly — we never see your key or resume. This tool only reads
              publicly visible LinkedIn job listings when you scrape.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">
          Data Management
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-red-900 mb-1">
                Delete all jobs
              </div>
              <p className="text-xs text-red-600">
                Permanently delete all {jobs.length} scraped jobs. This cannot
                be undone.
              </p>
            </div>
            <button
              onClick={handleClearAll}
              disabled={jobs.length === 0}
              className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Trash2 size={14} />
              Delete All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
