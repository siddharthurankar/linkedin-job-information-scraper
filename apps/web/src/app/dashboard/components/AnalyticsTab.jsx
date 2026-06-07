"use client";

import { useJobStore } from "@/app/dashboard/store";
import { getDisplayMatchScore } from "@/app/dashboard/utils/scoreDisplay";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

const COLORS = [
  "#2563EB",
  "#EA580C",
  "#10B981",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#EC4899",
];

const TOOLTIP_STYLE = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: "8px",
  fontSize: "12px",
};

export default function AnalyticsTab() {
  const { jobs, settings } = useJobStore();

  const analytics = useMemo(() => {
    const companyCounts = {};
    const skillCounts = {};
    const locationCounts = {};
    const levelCounts = {};
    const dateCounts = {};
    const scoreRanges = {
      "90-100": 0,
      "80-89": 0,
      "70-79": 0,
      "60-69": 0,
      "Below 60": 0,
      "No Score": 0,
    };

    jobs.forEach((job) => {
      if (job.company)
        companyCounts[job.company] = (companyCounts[job.company] || 0) + 1;
      if (job.location)
        locationCounts[job.location] = (locationCounts[job.location] || 0) + 1;
      (job.aiAnalysis?.tags || []).forEach((t) => {
        skillCounts[t] = (skillCounts[t] || 0) + 1;
      });
      const level = job.aiAnalysis?.experienceLevel || "Unknown";
      levelCounts[level] = (levelCounts[level] || 0) + 1;
      if (job.metadata?.scrapedAt) {
        const d = new Date(job.metadata.scrapedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        dateCounts[d] = (dateCounts[d] || 0) + 1;
      }
      const s = getDisplayMatchScore(job, settings);
      if (s == null) scoreRanges["No Score"]++;
      else if (s >= 90) scoreRanges["90-100"]++;
      else if (s >= 80) scoreRanges["80-89"]++;
      else if (s >= 70) scoreRanges["70-79"]++;
      else if (s >= 60) scoreRanges["60-69"]++;
      else scoreRanges["Below 60"]++;
    });

    return {
      topCompanies: Object.entries(companyCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({
          name: name.length > 20 ? name.slice(0, 20) + "…" : name,
          count,
        })),
      topSkills: Object.entries(skillCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count })),
      topLocations: Object.entries(locationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, value]) => ({
          name: name.length > 18 ? name.slice(0, 18) + "…" : name,
          value,
        })),
      scoreDistribution: Object.entries(scoreRanges)
        .filter(([, v]) => v > 0)
        .map(([range, count]) => ({ range, count })),
      experienceLevels: Object.entries(levelCounts).map(([name, value]) => ({
        name,
        value,
      })),
      jobTrend: Object.entries(dateCounts)
        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
        .slice(-14)
        .map(([date, count]) => ({ date, count })),
    };
  }, [jobs, settings]);

  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
        <div className="text-5xl mb-4">📊</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No data yet</h3>
        <p className="text-sm text-gray-500">
          Scrape LinkedIn jobs first — analytics will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">
            Top Companies
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analytics.topCompanies}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                angle={-30}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v) => [`${v} jobs`, "Count"]}
              />
              <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">
            Top Skills & Tags
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={analytics.topSkills}
              layout="vertical"
              margin={{ left: 0, right: 16 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                width={90}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v) => [`${v} jobs`, "Count"]}
              />
              <Bar dataKey="count" fill="#EA580C" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">
            Workplace Type
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={[
                  {
                    name: "Remote",
                    value: jobs.filter((j) => j.workplaceType === "Remote")
                      .length,
                  },
                  {
                    name: "Hybrid",
                    value: jobs.filter((j) => j.workplaceType === "Hybrid")
                      .length,
                  },
                  {
                    name: "On-site",
                    value: jobs.filter((j) => j.workplaceType === "On-site")
                      .length,
                  },
                ].filter((d) => d.value > 0)}
                cx="50%"
                cy="50%"
                outerRadius={75}
                dataKey="value"
                label={({ name, percent }) =>
                  percent > 0.08 ? `${(percent * 100).toFixed(0)}%` : ""
                }
                labelLine={false}
                fontSize={11}
              >
                {COLORS.map((c, i) => (
                  <Cell key={i} fill={c} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend
                iconSize={10}
                iconType="circle"
                wrapperStyle={{ fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">
            Experience Levels
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={analytics.experienceLevels}
                cx="50%"
                cy="50%"
                outerRadius={75}
                dataKey="value"
                label={({ percent }) =>
                  percent > 0.08 ? `${(percent * 100).toFixed(0)}%` : ""
                }
                labelLine={false}
                fontSize={11}
              >
                {analytics.experienceLevels.map((_, i) => (
                  <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend
                iconSize={10}
                iconType="circle"
                wrapperStyle={{ fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">
            AI Match Score Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analytics.scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v) => [`${v} jobs`, ""]}
              />
              <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">
            Top Locations
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={analytics.topLocations}
              layout="vertical"
              margin={{ left: 0, right: 16 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                width={100}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v) => [`${v} jobs`, "Count"]}
              />
              <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {analytics.jobTrend.length > 1 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">
              Jobs Scraped Over Time
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={analytics.jobTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v) => [`${v} jobs`, ""]}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  dot={{ fill: "#F59E0B", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
