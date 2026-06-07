"use client";

import { useState, useEffect } from "react";
import { useJobStore } from "@/app/dashboard/store";
import { Play, Check } from "lucide-react";

const SAMPLE_JOBS = [
  {
    id: "demo_1001",
    title: "Senior Full Stack Engineer",
    company: "TechCorp",
    jobUrl: "https://linkedin.com/jobs/view/1001",
    location: "San Francisco, CA",
    workplaceType: "Remote",
    easyApply: true,
    description:
      "Senior Full Stack Engineer with React, Node.js, and PostgreSQL. TypeScript, AWS, Docker required. Build scalable web applications.",
    metadata: {
      scrapedAt: Date.now(),
      sourcePage: "https://linkedin.com/jobs/search",
    },
  },
  {
    id: "demo_1002",
    title: "Machine Learning Engineer",
    company: "AI Innovations",
    jobUrl: "https://linkedin.com/jobs/view/1002",
    location: "New York, NY",
    workplaceType: "Hybrid",
    easyApply: false,
    description:
      "ML team building cutting-edge AI models. PyTorch, TensorFlow, Python. Computer vision and NLP at scale.",
    metadata: {
      scrapedAt: Date.now(),
      sourcePage: "https://linkedin.com/jobs/search",
    },
  },
  {
    id: "demo_1003",
    title: "Frontend Developer",
    company: "Startup Labs",
    jobUrl: "https://linkedin.com/jobs/view/1003",
    location: "Austin, TX",
    workplaceType: "Remote",
    easyApply: true,
    description:
      "Build user interfaces with React and TypeScript. Tailwind, Next.js, responsive design.",
    metadata: {
      scrapedAt: Date.now(),
      sourcePage: "https://linkedin.com/jobs/search",
    },
  },
  {
    id: "demo_1004",
    title: "DevOps Engineer",
    company: "CloudScale",
    jobUrl: "https://linkedin.com/jobs/view/1004",
    location: "Seattle, WA",
    workplaceType: "On-site",
    easyApply: false,
    description:
      "Cloud infrastructure and CI/CD pipelines. AWS, Docker, Kubernetes, Terraform.",
    metadata: {
      scrapedAt: Date.now(),
      sourcePage: "https://linkedin.com/jobs/search",
    },
  },
  {
    id: "demo_1005",
    title: "Product Manager",
    company: "FinTech Pro",
    jobUrl: "https://linkedin.com/jobs/view/1005",
    location: "Boston, MA",
    workplaceType: "Hybrid",
    easyApply: true,
    description:
      "Product strategy for fintech platform. Agile, roadmapping, analytics. Work with engineering and design.",
    metadata: {
      scrapedAt: Date.now(),
      sourcePage: "https://linkedin.com/jobs/search",
    },
  },
  {
    id: "demo_1006",
    title: "Data Scientist",
    company: "Analytics Hub",
    jobUrl: "https://linkedin.com/jobs/view/1006",
    location: "Chicago, IL",
    workplaceType: "Remote",
    easyApply: false,
    description:
      "Large datasets and predictive models. Python, SQL, machine learning, statistics.",
    metadata: {
      scrapedAt: Date.now(),
      sourcePage: "https://linkedin.com/jobs/search",
    },
  },
  {
    id: "demo_1007",
    title: "Backend Engineer",
    company: "API Solutions",
    jobUrl: "https://linkedin.com/jobs/view/1007",
    location: "Denver, CO",
    workplaceType: "Remote",
    easyApply: true,
    description:
      "Scalable APIs and microservices. Node.js, Go, GraphQL, PostgreSQL, Redis, Kafka.",
    metadata: {
      scrapedAt: Date.now(),
      sourcePage: "https://linkedin.com/jobs/search",
    },
  },
  {
    id: "demo_1008",
    title: "Senior Software Engineer",
    company: "BigTech Corp",
    jobUrl: "https://linkedin.com/jobs/view/1008",
    location: "Los Angeles, CA",
    workplaceType: "Hybrid",
    easyApply: false,
    description:
      "Platform team senior software engineer. 5+ years, Java, Spring Boot, Kubernetes, microservices.",
    metadata: {
      scrapedAt: Date.now(),
      sourcePage: "https://linkedin.com/jobs/search",
    },
  },
];

export default function DemoPage() {
  const { addJobs } = useJobStore();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);
  const [currentJob, setCurrentJob] = useState("");

  const simulateScraping = async () => {
    setLoading(true);
    setProgress(0);
    setComplete(false);

    // Simulate progress visually
    for (let i = 0; i < SAMPLE_JOBS.length; i++) {
      await new Promise((r) => setTimeout(r, 400));
      setCurrentJob(`${SAMPLE_JOBS[i].title} at ${SAMPLE_JOBS[i].company}`);
      setProgress(((i + 1) / SAMPLE_JOBS.length) * 100);
    }

    // Send all to API (API auto-enriches)
    await addJobs(SAMPLE_JOBS);

    setComplete(true);
    setLoading(false);
  };

  useEffect(() => {
    if (complete) {
      const t = setTimeout(() => {
        if (typeof window !== "undefined") window.location.href = "/dashboard";
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [complete]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full shadow-sm">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Demo: Sample Jobs
          </h1>
          <p className="text-sm text-gray-500">
            Load {SAMPLE_JOBS.length} sample LinkedIn jobs with AI analysis into
            your dashboard.
          </p>
        </div>

        {!loading && !complete && (
          <button
            onClick={simulateScraping}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <Play size={16} />
            Load Demo Jobs
          </button>
        )}

        {loading && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-gray-500">Processing jobs with AI…</span>
                <span className="font-bold text-gray-900">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            {currentJob && (
              <p className="text-xs text-gray-400 truncate">
                Processing: {currentJob}
              </p>
            )}
            <div className="space-y-1.5">
              {SAMPLE_JOBS.map((job, i) => {
                const done = i < (progress / 100) * SAMPLE_JOBS.length;
                return (
                  <div
                    key={job.id}
                    className={`flex items-center gap-2 text-xs ${done ? "text-gray-800" : "text-gray-300"}`}
                  >
                    {done ? (
                      <Check
                        size={13}
                        className="text-green-500 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-3.5 h-3.5 border-2 border-gray-200 rounded-full flex-shrink-0" />
                    )}
                    <span className="truncate">
                      {job.title} — {job.company}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {complete && (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <Check size={28} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Done!</h3>
              <p className="text-sm text-gray-500">
                {SAMPLE_JOBS.length} jobs added with AI scores
              </p>
            </div>
            <p className="text-xs text-gray-400">Redirecting to dashboard…</p>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
          <a
            href="/"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Back to setup
          </a>
          <a
            href="/dashboard"
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            Go to Dashboard →
          </a>
        </div>
      </div>
    </div>
  );
}
