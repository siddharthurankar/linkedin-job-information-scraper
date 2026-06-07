"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useJobStore } from "@/app/dashboard/store";
import {
  Search,
  Download,
  Trash2,
  ExternalLink,
  Filter,
  ChevronUp,
  ChevronDown,
  StickyNote,
  X,
  ChevronRight,
  Tag,
  Sparkles,
  Loader2,
} from "lucide-react";
import ExportModal from "@/app/dashboard/components/ExportModal";
import {
  canScore,
  getDisplayMatchScore,
  isGeminiScore,
  scoreLabel,
} from "@/app/dashboard/utils/scoreDisplay";

const SCORE_COLOR = (s) => {
  if (!s) return "text-gray-400 bg-gray-50";
  if (s >= 85) return "text-emerald-700 bg-emerald-50";
  if (s >= 70) return "text-blue-700 bg-blue-50";
  if (s >= 55) return "text-orange-700 bg-orange-50";
  return "text-gray-600 bg-gray-100";
};

const WORKPLACE_OPTS = [
  { v: "all", l: "All Workplaces" },
  { v: "Remote", l: "Remote" },
  { v: "Hybrid", l: "Hybrid" },
  { v: "On-site", l: "On-site" },
  { v: "Unknown", l: "Unknown" },
];

const EXPERIENCE_OPTS = [
  { v: "all", l: "All Levels" },
  { v: "Internship", l: "Internship" },
  { v: "New Grad", l: "New Grad" },
  { v: "Entry Level", l: "Entry Level" },
  { v: "Mid Level", l: "Mid Level" },
  { v: "Senior", l: "Senior" },
  { v: "Lead", l: "Lead" },
];

const CATEGORY_OPTS = [
  { v: "all", l: "All Categories" },
  { v: "Software", l: "Software" },
  { v: "AI", l: "AI" },
  { v: "Data", l: "Data" },
  { v: "Product", l: "Product" },
  { v: "Business", l: "Business" },
  { v: "Research", l: "Research" },
  { v: "Other", l: "Other" },
];

export default function JobsTab() {
  const {
    jobs,
    deleteJob,
    deleteJobs,
    settings,
    loadSettings,
    scoreJob,
    scoreUnscoredJobs,
    scoringJobId,
    scoringAll,
    error,
  } = useJobStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [showExport, setShowExport] = useState(false);
  const [sortBy, setSortBy] = useState("scraped");
  const [sortDir, setSortDir] = useState("desc");
  const [noteJobId, setNoteJobId] = useState(null);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  const [filters, setFilters] = useState({
    workplace: "all",
    experience: "all",
    easyApply: "all",
    roleCategory: "all",
    collection: "all",
  });

  // Get unique collections for dynamic filter
  const collections = useMemo(() => {
    const cols = new Set(jobs.map((j) => j.collection).filter(Boolean));
    return Array.from(cols).sort();
  }, [jobs]);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
    setSelected(new Set());
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    let list = jobs.filter((job) => {
      // Search filter — checks title, company, location, tags, keywords
      if (q) {
        const titleMatch = (job.title || "").toLowerCase().includes(q);
        const companyMatch = (job.company || "").toLowerCase().includes(q);
        const locationMatch = (job.location || "").toLowerCase().includes(q);
        const tagMatch = (job.aiAnalysis?.tags || []).some((t) =>
          t.toLowerCase().includes(q),
        );
        const keywordMatch = (job.keywords || []).some((k) =>
          k.toLowerCase().includes(q),
        );
        const descMatch = (job.description || "").toLowerCase().includes(q);
        if (
          !titleMatch &&
          !companyMatch &&
          !locationMatch &&
          !tagMatch &&
          !keywordMatch &&
          !descMatch
        ) {
          return false;
        }
      }

      // Workplace filter
      if (filters.workplace !== "all") {
        const wt = job.workplaceType || "Unknown";
        if (wt !== filters.workplace) return false;
      }

      // Experience filter
      if (filters.experience !== "all") {
        const level = job.aiAnalysis?.experienceLevel || "";
        if (level !== filters.experience) return false;
      }

      // Easy Apply filter
      if (filters.easyApply === "yes" && !job.easyApply) return false;
      if (filters.easyApply === "no" && job.easyApply) return false;

      // Role category filter (AI-detected)
      if (filters.roleCategory !== "all") {
        const rc = job.aiAnalysis?.roleCategory || "Other";
        if (rc !== filters.roleCategory) return false;
      }

      // Collection filter (user-set category from bookmarklet)
      if (filters.collection !== "all") {
        const col = job.collection || "";
        if (col !== filters.collection) return false;
      }

      return true;
    });

    // Sort
    list = list.slice().sort((a, b) => {
      let av, bv;
      if (sortBy === "title") {
        av = a.title || "";
        bv = b.title || "";
      } else if (sortBy === "company") {
        av = a.company || "";
        bv = b.company || "";
      } else if (sortBy === "score") {
        av = getDisplayMatchScore(a, settings) || 0;
        bv = getDisplayMatchScore(b, settings) || 0;
      } else {
        av = a.metadata?.scrapedAt || 0;
        bv = b.metadata?.scrapedAt || 0;
      }

      if (typeof av === "string")
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === "asc" ? av - bv : bv - av;
    });

    return list;
  }, [jobs, search, sortBy, sortDir, filters]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const handleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(col);
      setSortDir("desc");
    }
    setPage(1);
  };

  const toggleSelect = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const toggleAll = () => {
    if (selected.size === paginated.length && paginated.length > 0)
      setSelected(new Set());
    else setSelected(new Set(paginated.map((j) => j.id)));
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`Delete ${selected.size} job${selected.size > 1 ? "s" : ""}?`))
      return;
    await deleteJobs(Array.from(selected));
    setSelected(new Set());
  };

  const clearFilters = () => {
    setFilters({
      workplace: "all",
      experience: "all",
      easyApply: "all",
      roleCategory: "all",
      collection: "all",
    });
    setSearch("");
    setPage(1);
  };

  const activeFilterCount =
    Object.values(filters).filter((v) => v !== "all").length + (search ? 1 : 0);
  const exportList =
    selected.size > 0 ? jobs.filter((j) => selected.has(j.id)) : filtered;

  const scoringReady =
    canScore(settings) && settings.geminiScoringEnabled === true;
  const unscoredCount = jobs.filter((j) => !isGeminiScore(j)).length;

  const SortIcon = ({ col }) => {
    if (sortBy !== col)
      return <ChevronDown size={12} className="text-gray-300 inline ml-0.5" />;
    return sortDir === "asc" ? (
      <ChevronUp size={12} className="text-blue-500 inline ml-0.5" />
    ) : (
      <ChevronDown size={12} className="text-blue-500 inline ml-0.5" />
    );
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {scoringReady && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-violet-900">
            <span className="font-semibold">Gemini scoring on.</span>{" "}
            {unscoredCount > 0
              ? `${unscoredCount} job${unscoredCount === 1 ? "" : "s"} not scored yet.`
              : "All jobs scored."}
          </div>
          {unscoredCount > 0 && (
            <button
              type="button"
              disabled={scoringAll}
              onClick={() => scoreUnscoredJobs()}
              className="inline-flex items-center gap-1.5 bg-violet-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-violet-700 disabled:opacity-50"
            >
              {scoringAll ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              {scoringAll ? "Scoring…" : `Score all unscored (${unscoredCount})`}
            </button>
          )}
        </div>
      )}

      {!scoringReady && jobs.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600">
          Match scores are hidden until you add a Gemini API key and resume in{" "}
          <strong>Settings</strong>. Keywords still work without AI.
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        {/* Search + Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search title, company, location, keyword, skill…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {selected.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors"
              >
                <Trash2 size={14} /> Delete ({selected.size})
              </button>
            )}
            <button
              onClick={() => setShowExport(true)}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40"
            >
              <Download size={14} />
              Export{" "}
              {selected.size > 0
                ? `(${selected.size})`
                : `(${filtered.length})`}
            </button>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
            <Filter size={12} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-blue-100 text-blue-700 rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </div>

          {/* Workplace */}
          <select
            value={filters.workplace}
            onChange={(e) => updateFilter("workplace", e.target.value)}
            className={`text-xs border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer ${filters.workplace !== "all" ? "border-blue-400 text-blue-700 bg-blue-50 font-semibold" : "border-gray-200 text-gray-600 bg-white"}`}
          >
            {WORKPLACE_OPTS.map((o) => (
              <option key={o.v} value={o.v}>
                {o.l}
              </option>
            ))}
          </select>

          {/* Experience */}
          <select
            value={filters.experience}
            onChange={(e) => updateFilter("experience", e.target.value)}
            className={`text-xs border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer ${filters.experience !== "all" ? "border-blue-400 text-blue-700 bg-blue-50 font-semibold" : "border-gray-200 text-gray-600 bg-white"}`}
          >
            {EXPERIENCE_OPTS.map((o) => (
              <option key={o.v} value={o.v}>
                {o.l}
              </option>
            ))}
          </select>

          {/* Role category */}
          <select
            value={filters.roleCategory}
            onChange={(e) => updateFilter("roleCategory", e.target.value)}
            className={`text-xs border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer ${filters.roleCategory !== "all" ? "border-blue-400 text-blue-700 bg-blue-50 font-semibold" : "border-gray-200 text-gray-600 bg-white"}`}
          >
            {CATEGORY_OPTS.map((o) => (
              <option key={o.v} value={o.v}>
                {o.l}
              </option>
            ))}
          </select>

          {/* Collection (user-defined category) */}
          {collections.length > 0 && (
            <select
              value={filters.collection}
              onChange={(e) => updateFilter("collection", e.target.value)}
              className={`text-xs border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer ${filters.collection !== "all" ? "border-purple-400 text-purple-700 bg-purple-50 font-semibold" : "border-gray-200 text-gray-600 bg-white"}`}
            >
              <option value="all">All Collections</option>
              {collections.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {/* Easy Apply */}
          <select
            value={filters.easyApply}
            onChange={(e) => updateFilter("easyApply", e.target.value)}
            className={`text-xs border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer ${filters.easyApply !== "all" ? "border-blue-400 text-blue-700 bg-blue-50 font-semibold" : "border-gray-200 text-gray-600 bg-white"}`}
          >
            <option value="all">All Apply Types</option>
            <option value="yes">Easy Apply Only</option>
            <option value="no">Regular Apply</option>
          </select>

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 font-medium"
            >
              <X size={12} /> Clear all
            </button>
          )}

          <span className="ml-auto text-xs text-gray-400 font-medium">
            {filtered.length} of {jobs.length} jobs
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={
                      paginated.length > 0 && selected.size === paginated.length
                    }
                    onChange={toggleAll}
                    className="rounded border-gray-300 text-blue-600"
                  />
                </th>
                {[
                  { col: "title", label: "Job Title", w: "min-w-[180px]" },
                  { col: "company", label: "Company", w: "min-w-[130px]" },
                  { col: null, label: "Location", w: "min-w-[120px]" },
                  { col: null, label: "Workplace", w: "w-24" },
                  { col: null, label: "Keywords", w: "min-w-[200px]" },
                  { col: "score", label: "Match", w: "w-24" },
                  { col: null, label: "", w: "w-24" },
                ].map((h, i) => (
                  <th
                    key={i}
                    onClick={h.col ? () => handleSort(h.col) : undefined}
                    className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap ${h.w} ${h.col ? "cursor-pointer hover:text-gray-700 select-none" : ""}`}
                  >
                    {h.label}
                    {h.col && <SortIcon col={h.col} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map((job) => {
                const isExpanded = expandedJobId === job.id;
                const hasDesc = job.description && job.description.length > 10;
                const hasKeywords = (job.keywords || []).length > 0;

                return (
                  <>
                    <tr
                      key={job.id}
                      className={`hover:bg-gray-50 transition-colors group ${isExpanded ? "bg-blue-50/30" : ""}`}
                    >
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={selected.has(job.id)}
                          onChange={() => toggleSelect(job.id)}
                          className="rounded border-gray-300 text-blue-600"
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-start gap-1.5">
                          {(hasDesc || hasKeywords) && (
                            <button
                              onClick={() =>
                                setExpandedJobId(isExpanded ? null : job.id)
                              }
                              className="mt-0.5 flex-shrink-0 text-gray-300 hover:text-blue-500 transition-colors"
                              title={
                                isExpanded
                                  ? "Collapse"
                                  : "Show description & keywords"
                              }
                            >
                              <ChevronRight
                                size={14}
                                className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
                              />
                            </button>
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 leading-snug">
                              {job.title}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {job.easyApply && (
                                <span className="text-[10px] bg-green-50 text-green-700 font-semibold rounded px-1.5 py-0.5 border border-green-100">
                                  Easy Apply
                                </span>
                              )}
                              {job.collection &&
                                job.collection !== "default" &&
                                job.collection !== "General" && (
                                  <span className="text-[10px] bg-purple-50 text-purple-700 font-semibold rounded px-1.5 py-0.5 border border-purple-100">
                                    {job.collection}
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-700 font-medium text-sm">
                        {job.company}
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 text-xs">
                        {job.location}
                      </td>
                      <td className="px-4 py-3.5">
                        {job.workplaceType &&
                        job.workplaceType !== "Unknown" ? (
                          <span className="text-xs border border-gray-200 rounded-full px-2.5 py-1 text-gray-600 whitespace-nowrap">
                            {job.workplaceType}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {hasKeywords ? (
                          <div className="flex flex-wrap gap-1">
                            {(job.keywords || []).slice(0, 5).map((kw) => (
                              <span
                                key={kw}
                                className="inline-flex items-center gap-0.5 text-[10px] bg-amber-50 text-amber-700 border border-amber-100 rounded px-1.5 py-0.5 font-medium"
                              >
                                <Tag size={8} />
                                {kw}
                              </span>
                            ))}
                            {(job.keywords || []).length > 5 && (
                              <span className="text-[10px] text-gray-400">
                                +{job.keywords.length - 5}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">
                            No description
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {(() => {
                          const displayScore = getDisplayMatchScore(
                            job,
                            settings,
                          );
                          const label = scoreLabel(job, settings);
                          const isScoring = scoringJobId === job.id;

                          if (displayScore != null) {
                            return (
                              <span
                                className={`text-xs font-bold rounded-full px-2.5 py-1 ${SCORE_COLOR(displayScore)}`}
                                title={job.aiAnalysis?.reasoning || ""}
                              >
                                {displayScore}%
                              </span>
                            );
                          }

                          if (scoringReady && label === "Score") {
                            return (
                              <button
                                type="button"
                                disabled={isScoring || scoringAll}
                                onClick={() => scoreJob(job.id)}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded-lg px-2 py-1 hover:bg-violet-100 disabled:opacity-50"
                              >
                                {isScoring ? (
                                  <Loader2 size={10} className="animate-spin" />
                                ) : (
                                  <Sparkles size={10} />
                                )}
                                Score
                              </button>
                            );
                          }

                          return (
                            <span
                              className="text-gray-400 text-[10px]"
                              title={
                                label === "Add API key" || label === "Add resume"
                                  ? `Go to Settings — ${label.toLowerCase()}`
                                  : undefined
                              }
                            >
                              {label || "—"}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {job.jobUrl && (
                            <a
                              href={job.jobUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                              title="Open on LinkedIn"
                            >
                              <ExternalLink size={15} />
                            </a>
                          )}
                          <button
                            onClick={() => setNoteJobId(job.id)}
                            className={`transition-colors ${job.notes ? "text-amber-500" : "text-gray-400 hover:text-amber-500"}`}
                            title={job.notes ? "Edit note" : "Add note"}
                          >
                            <StickyNote size={15} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Delete this job?"))
                                deleteJob(job.id);
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded description row */}
                    {isExpanded && (
                      <tr key={`${job.id}-expanded`} className="bg-blue-50/20">
                        <td />
                        <td colSpan={7} className="px-4 pb-4 pt-1">
                          {/* All keywords */}
                          {(job.keywords || []).length > 0 && (
                            <div className="mb-3">
                              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                                <Tag size={10} /> Top Keywords
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {(job.keywords || []).map((kw) => (
                                  <span
                                    key={kw}
                                    className="text-xs bg-amber-50 text-amber-800 border border-amber-200 rounded-lg px-2.5 py-1 font-medium"
                                  >
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {isGeminiScore(job) && job.aiAnalysis?.reasoning && (
                            <div className="mb-3">
                              <div className="text-[10px] font-bold text-violet-600 uppercase tracking-wide mb-1.5">
                                Match reasoning
                              </div>
                              <p className="text-sm text-gray-700 bg-violet-50/50 border border-violet-100 rounded-xl p-3">
                                {job.aiAnalysis.reasoning}
                              </p>
                            </div>
                          )}

                          {(job.aiAnalysis?.missingGaps || []).length > 0 && (
                            <div className="mb-3">
                              <div className="text-[10px] font-bold text-red-600 uppercase tracking-wide mb-1.5">
                                Gaps vs your resume
                              </div>
                              <ul className="text-sm text-gray-700 list-disc list-inside space-y-0.5">
                                {job.aiAnalysis.missingGaps.map((g) => (
                                  <li key={g}>{g}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* AI tags */}
                          {(job.aiAnalysis?.tags || []).length > 0 && (
                            <div className="mb-3">
                              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                                Skills & Tags
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {(job.aiAnalysis.tags || []).map((t) => (
                                  <span
                                    key={t}
                                    className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Description */}
                          {hasDesc && (
                            <div>
                              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                                Job Description
                              </div>
                              <div className="text-sm text-gray-600 leading-relaxed bg-white border border-gray-200 rounded-xl p-4 max-h-64 overflow-y-auto whitespace-pre-wrap">
                                {job.description}
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {job.notes && (
                            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                              <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-1">
                                Your Note
                              </div>
                              <div className="text-sm text-amber-900 whitespace-pre-wrap">
                                {job.notes}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {paginated.length === 0 && (
          <div className="py-16 text-center">
            <div className="text-3xl mb-3">🔍</div>
            <div className="text-sm font-semibold text-gray-700 mb-1">
              {jobs.length === 0
                ? "No jobs scraped yet"
                : "No jobs match your filters"}
            </div>
            <div className="text-xs text-gray-400">
              {jobs.length === 0
                ? "Use the bookmarklet on LinkedIn to start scraping"
                : "Try clearing some filters"}
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-3 text-xs text-blue-600 underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}{" "}
              jobs
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition-colors"
              >
                ← Prev
              </button>
              <span className="text-xs text-gray-500 px-2">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Note modal */}
      {noteJobId && (
        <NoteModal
          jobId={noteJobId}
          initialText={jobs.find((j) => j.id === noteJobId)?.notes || ""}
          onClose={() => setNoteJobId(null)}
        />
      )}

      {/* Export modal */}
      {showExport && (
        <ExportModal jobs={exportList} onClose={() => setShowExport(false)} />
      )}
    </div>
  );
}

function NoteModal({ jobId, initialText, onClose }) {
  const { updateJobNotes } = useJobStore();
  const [text, setText] = useState(initialText);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await updateJobNotes(jobId, text);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Add Note</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your notes about this job..."
            rows={5}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
}
