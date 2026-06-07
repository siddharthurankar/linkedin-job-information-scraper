"use client";

import { useState, useEffect } from "react";
import { useJobStore } from "@/app/dashboard/store";
import OverviewTab from "@/app/dashboard/components/OverviewTab";
import JobsTab from "@/app/dashboard/components/JobsTab";
import AnalyticsTab from "@/app/dashboard/components/AnalyticsTab";
import SettingsTab from "@/app/dashboard/components/SettingsTab";
import { Briefcase, RefreshCw, ArrowLeft, CheckCircle2, X } from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { loadJobs, loadSettings, addJobs, jobs, loading } = useJobStore();
  const [importBanner, setImportBanner] = useState(null); // { count, status }

  useEffect(() => {
    loadSettings();
    loadJobs();

    // Check for auto-import via window.name (from bookmarklet fallback)
    try {
      if (typeof window !== "undefined" && window.name) {
        const parsed = JSON.parse(window.name);
        if (
          parsed?.source === "li-scraper" &&
          Array.isArray(parsed.jobs) &&
          parsed.jobs.length > 0
        ) {
          const scraped = parsed.jobs;
          window.name = ""; // clear it
          setImportBanner({ status: "importing", count: scraped.length });
          addJobs(scraped).then((result) => {
            setImportBanner({
              status: "done",
              count: result?.count || scraped.length,
            });
            loadJobs();
          });
        }
      }
    } catch {}
  }, []);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "jobs", label: `Jobs (${jobs.length})` },
    { id: "analytics", label: "Analytics" },
    { id: "settings", label: "Settings" },
  ];

  const showEmpty = !loading && jobs.length === 0 && activeTab !== "settings";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Import Banner */}
      {importBanner && (
        <div
          className={`border-b px-6 py-3 flex items-center justify-between text-sm font-medium ${
            importBanner.status === "done"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {importBanner.status === "done" ? (
              <CheckCircle2 size={16} className="text-green-600" />
            ) : (
              <RefreshCw size={16} className="text-blue-600 animate-spin" />
            )}
            {importBanner.status === "done"
              ? `✓ Successfully imported ${importBanner.count} jobs from LinkedIn!`
              : `Importing ${importBanner.count} jobs from LinkedIn…`}
          </div>
          {importBanner.status === "done" && (
            <button
              onClick={() => setImportBanner(null)}
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              <X size={15} />
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="text-gray-400 hover:text-gray-700 transition-colors"
                title="Setup instructions"
              >
                <ArrowLeft size={18} />
              </a>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Briefcase size={15} className="text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900 leading-none">
                  LinkedIn Job Information Scraper
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  Your personal job pipeline
                </p>
              </div>
            </div>
            <button
              onClick={() => loadJobs()}
              disabled={loading}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-40"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-gray-200 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
                  activeTab === tab.id
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Empty state */}
      {showEmpty && (
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Briefcase size={28} className="text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No jobs yet</h2>
          <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
            Go to LinkedIn, click the <strong>"Scrape LinkedIn Jobs"</strong>{" "}
            bookmark, then click <strong>Save to Dashboard</strong>.
            <br />
            <span className="text-gray-400">Haven't set it up yet?</span>
          </p>
          <div className="flex items-center justify-center gap-3">
            <a
              href="/"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Setup Instructions
            </a>
            <a
              href="/dashboard/demo"
              className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Try Demo →
            </a>
          </div>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && !importBanner && (
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 h-24 opacity-60"
            />
          ))}
        </div>
      )}

      {/* Tab content */}
      {(!loading || jobs.length > 0) && !showEmpty && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "jobs" && <JobsTab />}
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "settings" && <SettingsTab />}
        </div>
      )}

      {/* Settings always visible */}
      {!loading && jobs.length === 0 && activeTab === "settings" && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <SettingsTab />
        </div>
      )}
    </div>
  );
}