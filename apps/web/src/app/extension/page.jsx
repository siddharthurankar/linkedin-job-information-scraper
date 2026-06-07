export default function ExtensionFilesPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-gray-900 tracking-tight mb-2">
            Smart LinkedIn Job Intelligence
          </h1>
          <p className="text-sm text-gray-500">Chrome Extension Setup Guide</p>
        </div>

        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Start
            </h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-start gap-2">
                <span className="text-gray-400">-</span>
                The dashboard is fully functional and accessible at{" "}
                <a
                  href="/dashboard"
                  className="text-blue-600 hover:text-blue-700"
                >
                  /dashboard
                </a>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-gray-400">-</span>
                Try the demo scraping simulation at{" "}
                <a
                  href="/dashboard/demo"
                  className="text-blue-600 hover:text-blue-700"
                >
                  /dashboard/demo
                </a>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-gray-400">-</span>
                For production use, copy the extension files below to create a
                Chrome extension
              </p>
              <p className="flex items-start gap-2">
                <span className="text-gray-400">-</span>
                The extension will communicate with the dashboard via IndexedDB
              </p>
            </div>
          </div>

          {/* Installation Steps */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Installation Steps
            </h2>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                  1
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900 mb-1">
                    Create Extension Folder
                  </div>
                  <p className="text-sm text-gray-600">
                    Create a new folder (e.g.,{" "}
                    <code className="bg-gray-50 px-2 py-0.5 rounded text-xs">
                      linkedin-job-extension
                    </code>
                    )
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                  2
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900 mb-1">
                    Copy Extension Files
                  </div>
                  <p className="text-sm text-gray-600">
                    Copy the files below into your extension folder
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                  3
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900 mb-1">
                    Load Extension
                  </div>
                  <p className="text-sm text-gray-600">
                    Go to{" "}
                    <code className="bg-gray-50 px-2 py-0.5 rounded text-xs">
                      chrome://extensions/
                    </code>
                    , enable Developer mode, and click "Load unpacked"
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                  4
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900 mb-1">
                    Start Scraping
                  </div>
                  <p className="text-sm text-gray-600">
                    Visit LinkedIn, click the extension icon, and start scraping
                    jobs
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Extension Code */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Extension Files Reference
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              The extension uses manifest.json, content scripts, and background
              workers to scrape LinkedIn. All scraped data is stored in
              IndexedDB and synced with the dashboard automatically.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-xs font-mono text-gray-600 overflow-x-auto">
              {`Extension communicates with dashboard via:
• IndexedDB for local storage
• Chrome runtime messages for coordination
• Content scripts inject into LinkedIn pages
• Background worker manages scraping state

The dashboard at /dashboard provides:
• Job management and filtering
• AI analysis and enrichment
• Export to CSV/JSON/Excel
• Analytics and visualizations`}
            </div>
          </div>

          {/* Dashboard Link */}
          <div className="bg-blue-50 rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Dashboard Ready
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              The full-featured dashboard is already deployed and ready to use.
              Try the demo to see it in action.
            </p>
            <div className="flex gap-3">
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Open Dashboard
              </a>
              <a
                href="/dashboard/demo"
                className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Try Demo
              </a>
            </div>
          </div>

          {/* Architecture Note */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              Architecture Overview
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p className="flex items-start gap-2">
                <span className="text-gray-400">-</span>
                <strong className="text-gray-900">Dashboard (React):</strong>{" "}
                Fully functional web app with job management, analytics, export,
                and AI enrichment
              </p>
              <p className="flex items-start gap-2">
                <span className="text-gray-400">-</span>
                <strong className="text-gray-900">Extension (Chrome):</strong>{" "}
                Content scripts scrape LinkedIn pages and store data in
                IndexedDB
              </p>
              <p className="flex items-start gap-2">
                <span className="text-gray-400">-</span>
                <strong className="text-gray-900">Storage (IndexedDB):</strong>{" "}
                All data is local-first, private, and synchronized between
                extension and dashboard
              </p>
              <p className="flex items-start gap-2">
                <span className="text-gray-400">-</span>
                <strong className="text-gray-900">AI Integration:</strong> Bring
                your own API keys (OpenAI, Anthropic, Google) for job enrichment
              </p>
            </div>
          </div>

          {/* Features List */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              What's Included
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></span>
                  Job scraping from LinkedIn
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></span>
                  AI-powered job analysis
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></span>
                  Smart filtering and search
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></span>
                  Export to CSV/JSON/Excel
                </p>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></span>
                  Analytics dashboard
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></span>
                  Bulk job management
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></span>
                  Duplicate detection
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></span>
                  Local-first privacy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
