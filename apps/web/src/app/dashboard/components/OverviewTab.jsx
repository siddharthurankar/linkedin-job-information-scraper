"use client";

import { useJobStore } from "@/app/dashboard/store";
import { getDisplayMatchScore } from "@/app/dashboard/utils/scoreDisplay";
import {
  Briefcase,
  Building2,
  TrendingUp,
  Wifi,
  ExternalLink,
} from "lucide-react";

export default function OverviewTab() {
  const { jobs, settings } = useJobStore();

  const total = jobs.length;
  const companies = new Set(jobs.map((j) => j.company).filter(Boolean)).size;
  const scored = jobs
    .map((j) => getDisplayMatchScore(j, settings))
    .filter((s) => s != null);
  const avgScore = scored.length
    ? Math.round(scored.reduce((s, n) => s + n, 0) / scored.length)
    : 0;
  const remote = jobs.filter((j) => j.workplaceType === "Remote").length;
  const hybrid = jobs.filter((j) => j.workplaceType === "Hybrid").length;
  const onsite = jobs.filter((j) => j.workplaceType === "On-site").length;

  // Top skills/tags
  const tagMap = {};
  jobs.forEach((j) => {
    (j.aiAnalysis?.tags || []).forEach((t) => {
      tagMap[t] = (tagMap[t] || 0) + 1;
    });
  });
  const topTags = Object.entries(tagMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  // Recent jobs
  const recent = [...jobs]
    .sort((a, b) => (b.metadata?.scrapedAt || 0) - (a.metadata?.scrapedAt || 0))
    .slice(0, 8);

  // Role distribution
  const roleMap = {};
  jobs.forEach((j) => {
    const r = j.aiAnalysis?.roleCategory || "Other";
    roleMap[r] = (roleMap[r] || 0) + 1;
  });
  const roles = Object.entries(roleMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const statCards = [
    { label: "Total Jobs", value: total, icon: Briefcase, color: "blue" },
    { label: "Companies", value: companies, icon: Building2, color: "purple" },
    {
      label: "Avg resume match",
      value: avgScore ? `${avgScore}%` : "—",
      icon: TrendingUp,
      color: "green",
    },
    { label: "Remote Roles", value: remote, icon: Wifi, color: "orange" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          const colors = {
            blue: "bg-blue-50 text-blue-600",
            purple: "bg-purple-50 text-purple-600",
            green: "bg-green-50 text-green-600",
            orange: "bg-orange-50 text-orange-600",
          };
          return (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${colors[s.color]}`}
              >
                <Icon size={18} />
              </div>
              <div className="text-3xl font-bold text-gray-900 tracking-tight">
                {s.value}
              </div>
              <div className="text-xs text-gray-500 font-medium mt-1">
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workplace split */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">
            Workplace Type
          </h2>
          {total === 0 ? (
            <p className="text-sm text-gray-400">No data yet</p>
          ) : (
            <div className="space-y-3">
              {[
                { label: "Remote", count: remote, color: "bg-blue-500" },
                { label: "Hybrid", count: hybrid, color: "bg-orange-400" },
                { label: "On-site", count: onsite, color: "bg-gray-400" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-semibold text-gray-900">
                      {item.count}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{
                        width: `${total > 0 ? (item.count / total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Role categories */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">
            Role Categories
          </h2>
          {roles.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet</p>
          ) : (
            <div className="space-y-2">
              {roles.map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{role}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(count / total) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-6 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Tags */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">
            Top Skills & Tags
          </h2>
          {topTags.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {topTags.map(([tag, count]) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 rounded-full px-2.5 py-1 text-xs font-medium"
                >
                  {tag}
                  <span className="bg-blue-100 text-blue-600 rounded-full px-1.5 text-[10px] font-bold">
                    {count}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Jobs */}
      {recent.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">
              Recently Scraped
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recent.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {job.title}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {job.company} · {job.location}
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                  {job.workplaceType && job.workplaceType !== "Unknown" && (
                    <span className="hidden sm:inline text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-1">
                      {job.workplaceType}
                    </span>
                  )}
                  {getDisplayMatchScore(job, settings) != null && (
                    <span className="text-xs bg-blue-50 text-blue-700 font-bold rounded-full px-2.5 py-1">
                      {getDisplayMatchScore(job, settings)}%
                    </span>
                  )}
                  {job.jobUrl && (
                    <a
                      href={job.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-blue-500 transition-colors"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
