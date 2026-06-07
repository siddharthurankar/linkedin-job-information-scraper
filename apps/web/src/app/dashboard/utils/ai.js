import { getDisplayMatchScore } from "@/app/dashboard/utils/scoreDisplay";

export { scoreJobWithGemini } from "@/app/dashboard/utils/gemini";
export {
  canScore,
  getDisplayMatchScore,
  isGeminiScore,
  scoreLabel,
} from "@/app/dashboard/utils/scoreDisplay";

export function serializeGeminiReasoning({ reasoning, missingGaps }) {
  return JSON.stringify({
    source: "gemini",
    reasoning,
    missingGaps: missingGaps || [],
    scoredAt: Date.now(),
  });
}

export function parseGeminiReasoning(raw) {
  if (!raw || typeof raw !== "string") return null;
  try {
    const data = JSON.parse(raw);
    if (data?.source === "gemini") return data;
  } catch {
    /* legacy plain-text reasoning */
  }
  return null;
}

export function calculateOverallStats(jobs, settings = {}) {
  if (!jobs || jobs.length === 0) {
    return {
      totalJobs: 0,
      companiesCount: 0,
      averageMatchScore: 0,
      topSkills: [],
      remoteCount: 0,
      onsiteCount: 0,
      hybridCount: 0,
    };
  }

  const companies = new Set(jobs.map((j) => j.company));
  const matchScores = jobs
    .map((j) => getDisplayMatchScore(j, settings))
    .filter((s) => s != null);

  const averageMatchScore =
    matchScores.length > 0
      ? Math.round(matchScores.reduce((a, b) => a + b, 0) / matchScores.length)
      : 0;

  const skillCounts = {};
  jobs.forEach((job) => {
    (job.aiAnalysis?.tags || []).forEach((tag) => {
      skillCounts[tag] = (skillCounts[tag] || 0) + 1;
    });
  });

  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, count }));

  return {
    totalJobs: jobs.length,
    companiesCount: companies.size,
    averageMatchScore,
    topSkills,
    remoteCount: jobs.filter((j) => j.workplaceType === "Remote").length,
    onsiteCount: jobs.filter((j) => j.workplaceType === "On-site").length,
    hybridCount: jobs.filter((j) => j.workplaceType === "Hybrid").length,
  };
}
