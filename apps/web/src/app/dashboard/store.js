import { create } from "zustand";
import { scoreJobWithGemini } from "@/app/dashboard/utils/gemini";
import { serializeGeminiReasoning } from "@/app/dashboard/utils/ai";

const SETTINGS_KEY = "liJobSettings";
const RESUME_KEY = "liJobResume";

export const useJobStore = create((set, get) => ({
  jobs: [],
  loading: false,
  error: null,
  scoringJobId: null,
  scoringAll: false,

  settings: {
    preferredExportFormat: "csv",
    geminiApiKey: "",
    geminiScoringEnabled: false,
    theme: "light",
    resumeText: "",
  },

  loadJobs: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const query = new URLSearchParams();
      if (params.search) query.set("search", params.search);
      if (params.workplace) query.set("workplace", params.workplace);
      if (params.limit) query.set("limit", params.limit);
      const res = await fetch(`/api/jobs?${query.toString()}`);
      if (!res.ok) throw new Error(`Failed to load jobs: ${res.statusText}`);
      const data = await res.json();
      const jobs = (data.jobs || []).map((j) => ({
        ...j,
        keywords: Array.isArray(j.keywords) ? j.keywords : [],
        aiAnalysis: {
          ...(j.aiAnalysis || {}),
          tags: Array.isArray(j.aiAnalysis?.tags) ? j.aiAnalysis.tags : [],
          missingGaps: Array.isArray(j.aiAnalysis?.missingGaps)
            ? j.aiAnalysis.missingGaps
            : [],
        },
      }));
      set({ jobs, loading: false });
    } catch (err) {
      console.error("loadJobs error:", err);
      set({ error: err.message, loading: false });
    }
  },

  addJobs: async (newJobs) => {
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobs: newJobs }),
      });
      if (!res.ok) throw new Error(`Failed to add jobs: ${res.statusText}`);
      const data = await res.json();
      await get().loadJobs();
      return data;
    } catch (err) {
      console.error("addJobs error:", err);
      return { error: err.message };
    }
  },

  deleteJob: async (id) => {
    try {
      await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      set({ jobs: get().jobs.filter((j) => j.id !== id) });
    } catch (err) {
      console.error("deleteJob error:", err);
    }
  },

  deleteJobs: async (ids) => {
    try {
      await Promise.all(
        ids.map((id) => fetch(`/api/jobs/${id}`, { method: "DELETE" })),
      );
      set({ jobs: get().jobs.filter((j) => !ids.includes(j.id)) });
    } catch (err) {
      console.error("deleteJobs error:", err);
    }
  },

  clearAllJobs: async () => {
    try {
      await fetch("/api/jobs", { method: "DELETE" });
      set({ jobs: [] });
    } catch (err) {
      console.error("clearAllJobs error:", err);
    }
  },

  updateJobNotes: async (id, notes) => {
    try {
      await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      set({
        jobs: get().jobs.map((j) => (j.id === id ? { ...j, notes } : j)),
      });
    } catch (err) {
      console.error("updateJobNotes error:", err);
    }
  },

  updateJobGeminiScore: async (id, { matchScore, reasoning, missingGaps }) => {
    const aiReasoning = serializeGeminiReasoning({ reasoning, missingGaps });
    const res = await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchScore, aiReasoning }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to save score");
    }

    const aiAnalysis = {
      matchScore,
      reasoning,
      missingGaps: missingGaps || [],
      scoredWithGemini: true,
      scoredAt: Date.now(),
    };

    set({
      jobs: get().jobs.map((j) =>
        j.id === id
          ? {
              ...j,
              aiAnalysis: { ...(j.aiAnalysis || {}), ...aiAnalysis },
            }
          : j,
      ),
    });
    return aiAnalysis;
  },

  scoreJob: async (jobId) => {
    const { settings, jobs } = get();
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return { error: "Job not found" };

    set({ scoringJobId: jobId, error: null });
    try {
      const result = await scoreJobWithGemini(
        settings.geminiApiKey,
        settings.resumeText,
        job,
      );
      await get().updateJobGeminiScore(jobId, result);
      return { success: true, ...result };
    } catch (err) {
      set({ error: err.message });
      return { error: err.message };
    } finally {
      set({ scoringJobId: null });
    }
  },

  scoreUnscoredJobs: async () => {
    const { settings, jobs } = get();
    const unscored = jobs.filter((j) => !j.aiAnalysis?.scoredWithGemini);
    if (!unscored.length) return { scored: 0 };

    set({ scoringAll: true, error: null });
    let scored = 0;
    try {
      for (const job of unscored) {
        set({ scoringJobId: job.id });
        const result = await scoreJobWithGemini(
          settings.geminiApiKey,
          settings.resumeText,
          job,
        );
        await get().updateJobGeminiScore(job.id, result);
        scored++;
        await new Promise((r) => setTimeout(r, 400));
      }
      return { scored };
    } catch (err) {
      set({ error: err.message });
      return { error: err.message, scored };
    } finally {
      set({ scoringJobId: null, scoringAll: false });
    }
  },

  updateSettings: (newSettings) => {
    const updated = { ...get().settings, ...newSettings };
    set({ settings: updated });
    if (typeof window !== "undefined") {
      const { resumeText, ...rest } = updated;
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(rest));
      if (resumeText !== undefined) {
        localStorage.setItem(RESUME_KEY, resumeText);
      }
    }
  },

  loadSettings: () => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(SETTINGS_KEY);
    const resume = localStorage.getItem(RESUME_KEY) || "";
    let parsed = {};
    if (saved) {
      try {
        parsed = JSON.parse(saved);
      } catch {
        /* ignore */
      }
    }
    set({
      settings: {
        ...get().settings,
        ...parsed,
        resumeText: resume,
      },
    });
  },
}));
