import {
  BookOpen,
  Rocket,
  Settings,
  Download,
  Tag,
  Brain,
  Shield,
  Layers,
} from "lucide-react";

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <a
            href="/"
            className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back to setup
          </a>
          <h1 className="text-4xl font-semibold text-gray-900 tracking-tight mb-2">
            User Guide
          </h1>
          <p className="text-sm text-gray-500">
            Smart LinkedIn Job Intelligence — complete reference
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* Getting Started */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Rocket size={20} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
              Getting Started
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                n: "1",
                title: "Install the bookmarklet (one time only)",
                body: "Go to the home page and drag the blue button into your browser's bookmarks bar. Works in Chrome, Firefox, Safari, and Edge — no extension install required.",
              },
              {
                n: "2",
                title: "Go to LinkedIn Jobs and search",
                body: "Search for any job on linkedin.com/jobs. The scraper works best on the search results page after you've typed a job title.",
              },
              {
                n: "3",
                title: "Click the bookmark — set your category — scrape",
                body: "Click 'Scrape LinkedIn Jobs' in your bookmarks bar. A panel appears. Type a category name (e.g. 'Tech Jobs', 'Finance', 'Business') so you can filter by it later. Check 'Include full descriptions' to get the complete job text. Then click Start Scraping.",
              },
              {
                n: "4",
                title: "Save to dashboard",
                body: "When scraping finishes, click Save to Dashboard. Jobs appear instantly with AI tags, keywords, and scores.",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="bg-white rounded-xl border border-gray-200 p-5 flex gap-4"
              >
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {s.n}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">
                    {s.title}
                  </h3>
                  <p className="text-sm text-gray-600">{s.body}</p>
                </div>
              </div>
            ))}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <h3 className="text-sm font-bold text-blue-900 mb-2">
                💡 Tip: No page refresh needed
              </h3>
              <p className="text-sm text-blue-800">
                You can click the bookmarklet multiple times on the same
                LinkedIn page without refreshing. Each click creates a fresh
                scraping panel. Great for scraping multiple searches.
              </p>
            </div>
          </div>
        </section>

        {/* Keywords */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Tag size={20} className="text-amber-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
              Top 10 Keywords (Most Important Feature)
            </h2>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-4">
              Every job with a scraped description automatically gets a{" "}
              <strong>Top 10 Keywords</strong> list — the most critical terms
              from that specific posting.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <div className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2">
                  How keywords are extracted
                </div>
                <ul className="text-sm text-amber-900 space-y-1">
                  <li>
                    • Terms near "required", "must have", "mandatory" → triple
                    weight
                  </li>
                  <li>• Words appearing most frequently → high weight</li>
                  <li>• Terms matching the job title → double weight</li>
                  <li>• Common stop words removed</li>
                </ul>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <div className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2">
                  Why it matters
                </div>
                <ul className="text-sm text-amber-900 space-y-1">
                  <li>• Use these exact words in your resume</li>
                  <li>• Mirror them in your cover letter</li>
                  <li>• ATS systems scan for keyword matches</li>
                  <li>• Shows what the recruiter cares most about</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Note: Keywords are only extracted if you checked "Include full
              descriptions" when scraping. Descriptions with more content
              produce better keywords.
            </p>
          </div>
        </section>

        {/* Categories */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Layers size={20} className="text-purple-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
              Collections / Categories
            </h2>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-4">
              Before scraping, you can label the batch with your own category
              name. This lets you group and filter jobs in the dashboard.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                Example workflow
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-3">
                  <span className="bg-purple-100 text-purple-700 rounded-full px-2.5 py-1 text-xs font-bold">
                    Tech Jobs
                  </span>{" "}
                  Search "Software Engineer" → scrape → label "Tech Jobs"
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-blue-100 text-blue-700 rounded-full px-2.5 py-1 text-xs font-bold">
                    Finance
                  </span>{" "}
                  Search "Financial Analyst" → scrape → label "Finance"
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-green-100 text-green-700 rounded-full px-2.5 py-1 text-xs font-bold">
                    Business
                  </span>{" "}
                  Search "Business Development" → scrape → label "Business"
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              In the Jobs tab, the <strong>Collections</strong> filter dropdown
              shows all your category names. Select one to see only those jobs.
            </p>
          </div>
        </section>

        {/* Dashboard Features */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <BookOpen size={20} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
              Dashboard Features
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Overview Tab",
                items: [
                  "Total jobs, companies, avg score",
                  "Remote vs hybrid vs on-site chart",
                  "Top skills & tags cloud",
                  "Recently scraped jobs",
                ],
              },
              {
                title: "Jobs Tab",
                items: [
                  "Search by title, company, keyword, skill",
                  "Filter by workplace, level, category, collection, Easy Apply",
                  "Click any row to expand full description + keywords",
                  "Export to CSV / Excel / JSON",
                ],
              },
              {
                title: "Analytics Tab",
                items: [
                  "Top companies bar chart",
                  "Skills frequency chart",
                  "Location distribution",
                  "Experience level pie chart",
                  "AI score distribution",
                ],
              },
              {
                title: "Settings Tab",
                items: [
                  "Setup instructions reminder",
                  "Export format preference",
                  "Delete all data",
                ],
              },
            ].map((s) => (
              <div
                key={s.title}
                className="bg-white rounded-xl border border-gray-200 p-5"
              >
                <h3 className="text-sm font-bold text-gray-900 mb-2">
                  {s.title}
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {s.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-gray-300 flex-shrink-0">–</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Export */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Download size={20} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
              Exporting Data
            </h2>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-4">
              Click <strong>Export</strong> in the Jobs tab to download your
              data. Select specific jobs first (using checkboxes) to export only
              those, or export all filtered results.
            </p>
            <div className="space-y-3 mb-4">
              {[
                {
                  fmt: "CSV",
                  desc: "Opens in Excel, Google Sheets, Numbers. UTF-8 BOM included for proper special character support.",
                },
                {
                  fmt: "Excel (.xlsx)",
                  desc: "Native Excel format with auto column widths. Best for sharing with others.",
                },
                {
                  fmt: "JSON",
                  desc: "Structured data for developers or importing into other tools.",
                },
              ].map((f) => (
                <div key={f.fmt} className="flex items-start gap-3">
                  <span className="text-xs font-bold bg-gray-100 rounded px-2 py-1 text-gray-700 flex-shrink-0 mt-0.5">
                    {f.fmt}
                  </span>
                  <p className="text-sm text-gray-600">{f.desc}</p>
                </div>
              ))}
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <div className="text-xs font-bold text-amber-700 mb-1">
                Always include "Top 10 Keywords"
              </div>
              <p className="text-sm text-amber-800">
                This is the most valuable column — it shows the exact terms you
                need to mirror in your resume for each specific role.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Shield size={20} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
              Privacy
            </h2>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="space-y-3 text-sm text-gray-600">
              {[
                {
                  title: "No external servers",
                  body: "All scraped job data goes directly to your private database. Nothing is shared with third parties.",
                },
                {
                  title: "LinkedIn credentials never accessed",
                  body: "The scraper only reads publicly visible job information from the page DOM. It never touches your LinkedIn login or any personal account data.",
                },
                {
                  title: "You own your data",
                  body: "Delete everything anytime from the Settings tab. Export it anytime. It's yours.",
                },
              ].map((p) => (
                <div key={p.title} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="font-semibold text-gray-900">
                      {p.title}:{" "}
                    </span>
                    {p.body}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-gray-200 pt-12 flex flex-wrap gap-4">
          <a
            href="/dashboard"
            className="bg-blue-600 text-white rounded-xl px-5 py-3 text-sm font-bold hover:bg-blue-700 transition-colors"
          >
            Open Dashboard
          </a>
          <a
            href="/"
            className="bg-white border border-gray-200 text-gray-700 rounded-xl px-5 py-3 text-sm font-bold hover:bg-gray-50 transition-colors"
          >
            Setup Instructions
          </a>
          <a
            href="/dashboard/demo"
            className="bg-white border border-gray-200 text-gray-700 rounded-xl px-5 py-3 text-sm font-bold hover:bg-gray-50 transition-colors"
          >
            Try Demo
          </a>
        </section>
      </div>
    </div>
  );
}
