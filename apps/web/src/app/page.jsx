"use client";

import { useEffect, useRef, useState } from "react";
import {
  Briefcase,
  Chrome,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  BarChart3,
  Download,
} from "lucide-react";

export default function HomePage() {
  const bookmarkRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [appUrl, setAppUrl] = useState("");

  useEffect(() => {
    const base = window.location.origin;
    setAppUrl(base);

    // Build the bookmarklet code as a string, then URL-encode it
    const code = buildBookmarklet(base);
    if (bookmarkRef.current) {
      bookmarkRef.current.href = "javascript:" + encodeURIComponent(code);
    }
  }, []);

  function copyCode() {
    const code = "javascript:" + encodeURIComponent(buildBookmarklet(appUrl));
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase size={14} className="text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-sm">
              LinkedIn Job Information Scraper
            </span>
          </div>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Open Dashboard
            <ArrowRight size={14} />
          </a>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 rounded-full px-4 py-1.5 text-xs font-semibold mb-6 uppercase tracking-wide">
          <Chrome size={12} />
          Works in Chrome · Safari · Firefox · No install needed
        </div>
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-4">
          Scrape LinkedIn Jobs
          <br />
          Straight to Your Dashboard
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10">
          One click on LinkedIn — and all jobs automatically flow into your
          personal dashboard with AI scores, filters, and export. Zero setup.
          Fully private. Works in any browser.
        </p>
        <div className="flex items-center justify-center gap-4">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            View My Dashboard
          </a>
          <a
            href="#setup"
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            How to Set Up →
          </a>
        </div>
      </div>

      {/* --- SETUP SECTION --- */}
      <div id="setup" className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
            Set up in 2 minutes
          </h2>
          <p className="text-gray-500 text-center mb-12 text-sm">
            No Chrome extension to install. No account needed. Just a bookmark.
          </p>

          {/* Step 1 */}
          <div className="mb-10">
            <div className="flex items-start gap-5">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Drag this button to your bookmarks bar
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  First, make sure your bookmarks bar is visible. In Chrome:
                  press{" "}
                  <kbd className="bg-white border border-gray-200 rounded px-1.5 py-0.5 text-xs font-mono">
                    Ctrl+Shift+B
                  </kbd>{" "}
                  (Windows) or{" "}
                  <kbd className="bg-white border border-gray-200 rounded px-1.5 py-0.5 text-xs font-mono">
                    Cmd+Shift+B
                  </kbd>{" "}
                  (Mac). Then drag the blue button below into it.
                </p>

                {/* Bookmarklet button */}
                <div className="bg-white border-2 border-dashed border-blue-200 rounded-2xl p-8 flex flex-col items-center gap-4">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    ← Drag this to your bookmarks bar →
                  </p>
                  <a
                    ref={bookmarkRef}
                    href="#"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-blue-700 transition-colors cursor-grab active:cursor-grabbing select-none"
                    onClick={(e) => {
                      if (
                        bookmarkRef.current?.href === "#" ||
                        bookmarkRef.current?.href === window.location.href
                      ) {
                        e.preventDefault();
                        alert(
                          "First let the page fully load, then drag this button to your bookmarks bar."
                        );
                      }
                    }}
                    draggable="true"
                  >
                    <Briefcase size={16} />
                    🔗 Scrape LinkedIn Jobs
                  </a>
                  <p className="text-xs text-gray-400">
                    Can't drag?{" "}
                    <button
                      onClick={copyCode}
                      className="text-blue-600 underline hover:no-underline"
                    >
                      {copied ? "✓ Copied!" : "Copy the bookmarklet code"}
                    </button>{" "}
                    and manually add a new bookmark
                  </p>
                </div>

                {/* Manual instructions */}
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-amber-900 mb-2">
                    📌 If dragging doesn't work — manual method:
                  </p>
                  <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
                    <li>
                      Right-click your bookmarks bar → click{" "}
                      <strong>"Add page..."</strong> or{" "}
                      <strong>"Add bookmark"</strong>
                    </li>
                    <li>
                      Set the <strong>Name</strong> to:{" "}
                      <code className="bg-amber-100 px-1 rounded">
                        Scrape LinkedIn Jobs
                      </code>
                    </li>
                    <li>
                      Click the button below to copy the code, then paste it
                      into the <strong>URL/Address</strong> field
                    </li>
                    <li>Save it</li>
                  </ol>
                  <button
                    onClick={copyCode}
                    className="mt-3 inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-amber-700 transition-colors"
                  >
                    {copied ? "✓ Copied!" : "Copy Bookmarklet Code"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="mb-10">
            <div className="flex items-start gap-5">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Go to LinkedIn Jobs
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Open LinkedIn and go to any jobs page. Works best on these
                  pages:
                </p>
                <div className="space-y-2">
                  {[
                    {
                      label: "Job Search Results",
                      url: "https://www.linkedin.com/jobs/search/?keywords=software+engineer",
                      desc: "After searching for any job title",
                    },
                    {
                      label: "Saved Jobs",
                      url: "https://www.linkedin.com/my-items/saved-jobs/",
                      desc: "Your saved jobs collection",
                    },
                    {
                      label: "Any Job Page",
                      url: "https://www.linkedin.com/jobs/",
                      desc: "LinkedIn Jobs home feed",
                    },
                  ].map((item) => (
                    <a
                      key={item.label}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                    >
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {item.label}
                        </div>
                        <div className="text-xs text-gray-400">{item.desc}</div>
                      </div>
                      <ExternalLink
                        size={14}
                        className="text-gray-300 group-hover:text-blue-500 transition-colors"
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="mb-10">
            <div className="flex items-start gap-5">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Click the bookmark — set your category — scrape
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  On LinkedIn, click <strong>"Scrape LinkedIn Jobs"</strong> in
                  your bookmarks bar.
                </p>
                <div className="bg-white border border-gray-200 rounded-2xl p-4">
                  <div className="bg-gray-800 rounded-xl p-4 mb-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    {/* Mock scraper panel */}
                    <div className="bg-white rounded-xl p-3 w-72 mx-auto text-xs">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          <span className="font-bold text-gray-800">
                            LinkedIn Job Information Scraper
                          </span>
                        </div>
                        <span className="text-gray-400">✕</span>
                      </div>
                      {/* Category input */}
                      <div className="mb-2">
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                          Category / Collection Name
                        </div>
                        <div className="border border-blue-300 bg-blue-50 rounded-lg px-2 py-1.5 text-[11px] text-gray-700">
                          Tech Jobs
                        </div>
                        <div className="text-[9px] text-gray-400 mt-0.5">
                          Filter by this in dashboard later
                        </div>
                      </div>
                      {/* Description toggle */}
                      <div className="flex items-center gap-1.5 mb-3 bg-blue-50 border border-blue-200 rounded-lg p-1.5">
                        <div className="w-3 h-3 bg-blue-600 rounded flex-shrink-0"></div>
                        <div>
                          <div className="text-[10px] font-bold text-blue-800">
                            Include full descriptions
                          </div>
                          <div className="text-[9px] text-blue-500">
                            Auto-clicks Show more
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="bg-gray-50 rounded p-2 text-center">
                          <div className="text-lg font-bold text-blue-600">
                            47
                          </div>
                          <div className="text-gray-400 text-[9px]">
                            JOBS FOUND
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded p-2 text-center">
                          <div className="text-lg font-bold text-gray-800">
                            3
                          </div>
                          <div className="text-gray-400 text-[9px]">PAGES</div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded p-2 mb-2 h-10 overflow-hidden text-[9px] text-gray-400 leading-5">
                        <div>Page 1: 16 jobs with full descriptions</div>
                        <div>Page 2: 15 jobs processed...</div>
                      </div>
                      <button className="w-full bg-green-500 text-white rounded-lg py-1.5 text-[10px] font-bold">
                        Save to Dashboard →
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <CheckCircle2
                        size={14}
                        className="text-green-500 flex-shrink-0"
                      />
                      <strong>Type a category name</strong> — e.g. "Tech",
                      "Finance", "Business" (for filtering later)
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle2
                        size={14}
                        className="text-green-500 flex-shrink-0"
                      />
                      Check <strong>Include full descriptions</strong> —
                      auto-clicks "Show more" on every job
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle2
                        size={14}
                        className="text-green-500 flex-shrink-0"
                      />
                      Click <strong>Start Scraping</strong> → then{" "}
                      <strong>Save to Dashboard</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div>
            <div className="flex items-start gap-5">
              <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                ✓
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  View & manage your jobs here
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Come back to this dashboard to see all your scraped jobs with
                  AI analysis, filters, and export options.
                </p>
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
                >
                  Open My Dashboard
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
          Everything you get
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: BookOpen,
              title: "Smart Dashboard",
              desc: "All jobs in one table. Search, sort, filter by remote/hybrid/on-site, experience level, Easy Apply, and more.",
            },
            {
              icon: BarChart3,
              title: "Auto AI Analysis",
              desc: "Every job gets an AI match score, experience level tag, skill tags, and role category automatically.",
            },
            {
              icon: Download,
              title: "Export Anywhere",
              desc: "Export your full job list to CSV, JSON, or Excel in one click — with all AI data included.",
            },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-white border border-gray-200 rounded-2xl p-6"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={20} className="text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Common questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Do I need to install anything?",
                a: "No. This uses a bookmarklet — a tiny piece of JavaScript saved as a browser bookmark. No extension store, no permissions, no install.",
              },
              {
                q: "Does this work on Firefox or Safari?",
                a: "Yes! Bookmarklets work in every major browser including Chrome, Firefox, Safari, and Edge.",
              },
              {
                q: "Is my LinkedIn data private?",
                a: "Yes. All scraped data is stored only in your dashboard's database. Nothing is shared with third parties. Your LinkedIn credentials are never accessed.",
              },
              {
                q: "How many jobs can I scrape?",
                a: "Up to 3,000 jobs per session. The scraper auto-scrolls through pages automatically so you don't have to do anything.",
              },
              {
                q: "What if the panel doesn't appear on LinkedIn?",
                a: "Re-drag the bookmark from this page (an older copy may be broken on LinkedIn). Make sure you're on linkedin.com/jobs. You can click the bookmark multiple times without refreshing.",
              },
            ].map((item) => (
              <div
                key={item.q}
                className="bg-white border border-gray-200 rounded-xl p-5"
              >
                <h3 className="font-semibold text-gray-900 mb-1.5 text-sm">
                  {item.q}
                </h3>
                <p className="text-sm text-gray-500">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Bookmarklet builder ───────────────────────────────────────────────────
// UI is built with createElement (not innerHTML) because LinkedIn strips "&"
// from innerHTML, which breaks HTML entities and renders the panel as raw text.

function buildBookmarklet(appUrl) {
  return `(function(){
var old=document.getElementById('li-scraper-host');
if(old)old.remove();
var APP='${appUrl}';
var jobs=[];var running=false;var pages=0;
function mk(tag,st,txt){var n=document.createElement(tag);if(st)n.style.cssText=st;if(txt!=null)n.textContent=txt;return n;}
function gid(id){return root.getElementById(id);}
var host=document.createElement('div');
host.id='li-scraper-host';
host.style.cssText='position:fixed;top:16px;right:16px;z-index:2147483647;';
document.body.appendChild(host);
var root=host.attachShadow({mode:'open'});
var panel=mk('div','width:320px;background:#fff;border:1.5px solid #e5e7eb;border-radius:18px;box-shadow:0 24px 64px rgba(0,0,0,0.20);font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;font-size:13px;color:#111827;overflow:hidden;');
panel.id='li-scraper-panel';
var hdr=mk('div','padding:14px 16px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between;background:#fafafa;');
var hdrL=mk('div','display:flex;align-items:center;gap:8px;');
hdrL.appendChild(mk('div','width:9px;height:9px;background:#2563EB;border-radius:50%;'));
hdrL.appendChild(mk('span','font-weight:800;font-size:13px;','LinkedIn Job Information Scraper'));
hdr.appendChild(hdrL);
var closeBtn=mk('button','background:none;border:none;cursor:pointer;color:#9ca3af;font-size:17px;padding:0 4px;line-height:1;','\\u00D7');
closeBtn.id='ljs-close';
hdr.appendChild(closeBtn);
panel.appendChild(hdr);
var body=mk('div','padding:14px 16px;');
body.appendChild(mk('div','font-size:10px;font-weight:700;color:#6b7280;margin-bottom:5px;text-transform:uppercase;letter-spacing:.06em;','Category / Collection Name'));
var catIn=document.createElement('input');
catIn.id='ljs-cat';catIn.type='text';catIn.placeholder='e.g. Tech Jobs, Finance, Business...';
catIn.style.cssText='width:100%;border:1.5px solid #e5e7eb;border-radius:9px;padding:8px 10px;font-size:12px;outline:none;box-sizing:border-box;margin-bottom:4px;';
body.appendChild(catIn);
body.appendChild(mk('div','font-size:10px;color:#9ca3af;margin:0 0 11px;','Filter by this name in your dashboard'));
var descWrap=mk('div','margin-bottom:11px;display:flex;align-items:center;gap:8px;padding:9px 10px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:9px;cursor:pointer;');
descWrap.id='ljs-desc-wrap';
var descCb=document.createElement('input');
descCb.type='checkbox';descCb.id='ljs-desc';descCb.checked=true;
descCb.style.cssText='width:14px;height:14px;cursor:pointer;margin:0;';
descWrap.appendChild(descCb);
var descTxt=mk('div');
descTxt.appendChild(mk('div','font-size:11px;font-weight:700;color:#0369a1;','Include full descriptions'));
descTxt.appendChild(mk('div','font-size:10px;color:#0ea5e9;','Auto-clicks Show more \\u00b7 Slower but complete'));
descWrap.appendChild(descTxt);
body.appendChild(descWrap);
var stats=mk('div','display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:11px;');
var statJ=mk('div','background:#f9fafb;border-radius:9px;padding:10px;text-align:center;');
var cntEl=mk('div','font-size:24px;font-weight:900;color:#2563EB;line-height:1;','0');cntEl.id='ljs-count';
statJ.appendChild(cntEl);statJ.appendChild(mk('div','font-size:9px;color:#6b7280;margin-top:3px;font-weight:700;letter-spacing:.06em;','JOBS FOUND'));
var statP=mk('div','background:#f9fafb;border-radius:9px;padding:10px;text-align:center;');
var pgEl=mk('div','font-size:24px;font-weight:900;color:#111827;line-height:1;','0');pgEl.id='ljs-pages';
statP.appendChild(pgEl);statP.appendChild(mk('div','font-size:9px;color:#6b7280;margin-top:3px;font-weight:700;letter-spacing:.06em;','PAGES'));
stats.appendChild(statJ);stats.appendChild(statP);body.appendChild(stats);
var logEl=mk('div','background:#f9fafb;border-radius:9px;padding:10px;height:76px;overflow-y:auto;margin-bottom:11px;font-size:11px;color:#6b7280;line-height:1.7;font-family:monospace;');
logEl.id='ljs-log';body.appendChild(logEl);
var btnRow=mk('div','display:flex;gap:8px;');
var startBtn=mk('button','flex:1;background:#2563EB;color:#fff;border:none;border-radius:10px;padding:11px;font-size:12px;font-weight:800;cursor:pointer;','\\u25B6 Start Scraping');
startBtn.id='ljs-start';
var stopBtn=mk('button','background:#fff;border:1.5px solid #e5e7eb;color:#374151;border-radius:10px;padding:11px;font-size:12px;font-weight:800;cursor:pointer;display:none;','\\u25A0 Stop');
stopBtn.id='ljs-stop';
btnRow.appendChild(startBtn);btnRow.appendChild(stopBtn);body.appendChild(btnRow);
var saveWrap=mk('div','display:none;margin-top:10px;');saveWrap.id='ljs-save-wrap';
var saveBtn=mk('button','width:100%;background:#059669;color:#fff;border:none;border-radius:10px;padding:12px;font-size:12px;font-weight:800;cursor:pointer;','Save to Dashboard \\u2192');
saveBtn.id='ljs-save';saveWrap.appendChild(saveBtn);body.appendChild(saveWrap);
var openWrap=mk('div','display:none;margin-top:8px;');openWrap.id='ljs-open-wrap';
var openBtn=mk('button','width:100%;background:#7c3aed;color:#fff;border:none;border-radius:10px;padding:10px;font-size:12px;font-weight:800;cursor:pointer;','Open Dashboard \\u2192');
openBtn.id='ljs-open';openWrap.appendChild(openBtn);body.appendChild(openWrap);
panel.appendChild(body);root.appendChild(panel);
gid('ljs-desc-wrap').onclick=function(e){if(e.target.id!=='ljs-desc')gid('ljs-desc').click();};
function log(m){var d=document.createElement('div');d.textContent=m;logEl.appendChild(d);logEl.scrollTop=logEl.scrollHeight;}
function upd(){gid('ljs-count').textContent=jobs.length;gid('ljs-pages').textContent=pages;}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms);})}
function getCards(){
  var sels=['[data-occludable-job-id]','.jobs-search-results-list__list-item','.jobs-search-results__list-item','li[data-occludable-job-id]','.job-card-container--clickable','.scaffold-layout__list-container > ul > li','.jobs-search-results-list > li'];
  for(var i=0;i<sels.length;i++){var r=Array.from(document.querySelectorAll(sels[i]));if(r.length>0)return r;}
  return[];
}
function clickEl(el){
  if(!el)return;
  try{el.scrollIntoView({block:'nearest',behavior:'instant'});}catch(e){try{el.scrollIntoView();}catch(e2){}}
  try{el.click();}catch(e){}
  try{el.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));}catch(e){}
}
function isMoreBtn(b){
  var txt=(b.textContent||'').trim().toLowerCase().replace(/\\s+/g,' ');
  var lbl=(b.getAttribute('aria-label')||'').toLowerCase();
  if(!txt&&!lbl)return false;
  if(txt==='show more'||txt==='see more'||txt==='…see more'||txt==='...see more')return true;
  if(/^(show|see)\\s+more$/.test(txt))return true;
  if(/show more|see more|more description/.test(lbl))return true;
  if((txt.indexOf('show more')>=0||txt.indexOf('see more')>=0)&&txt.length<30)return true;
  return false;
}
function extractBasic(card){
  var jid=card.getAttribute('data-occludable-job-id')||card.getAttribute('data-job-id');
  if(!jid){var a0=card.querySelector('a[href*="/jobs/view/"]');if(a0){var m0=a0.href.match(/\\/jobs\\/view\\/(\\d+)/);if(m0)jid=m0[1];}}
  if(!jid)return null;
  var uid='li_'+jid;
  var tEl=card.querySelector('.job-card-list__title,.job-card-list__title--link,.job-card-container__link strong,.base-search-card__title,.artdeco-entity-lockup__title,[class*="job-card-list__title"]');
  var cEl=card.querySelector('.job-card-container__company-name,.job-card-list__company-name,.artdeco-entity-lockup__subtitle,.base-search-card__subtitle,[class*="company-name"]');
  var lEl=card.querySelector('.job-card-container__metadata-item,.job-search-card__location,.artdeco-entity-lockup__caption,[class*="metadata-item"]');
  var uEl=card.querySelector('a[href*="/jobs/view/"]');
  var t=tEl?tEl.textContent.trim():'';
  var co=cEl?cEl.textContent.trim():'';
  if(!t||!co)return null;
  var tx=card.textContent||'';
  var wt='Unknown';
  if(/remote/i.test(tx))wt='Remote';
  else if(/hybrid/i.test(tx))wt='Hybrid';
  else if(/on.site/i.test(tx))wt='On-site';
  return{id:uid,title:t,company:co,location:lEl?lEl.textContent.trim().replace(/\\s+/g,' '):'Unknown',jobUrl:uEl?uEl.href.split('?')[0]:location.href,workplaceType:wt,easyApply:!!(card.querySelector('.job-card-container__apply-method'))||/easy apply/i.test(tx),description:'',metadata:{scrapedAt:Date.now(),sourcePage:location.href}};
}
async function expandAndGetDesc(){
  await sleep(250);
  var detail=document.querySelector('.jobs-search__job-details,.jobs-details,.jobs-details__main-content,.scaffold-layout__detail');
  var scope=detail||document;
  for(var pass=0;pass<3;pass++){
    var allBtns=Array.from(scope.querySelectorAll('button,[role="button"]'));
    var clicked=false;
    for(var i=0;i<allBtns.length;i++){if(isMoreBtn(allBtns[i])){clickEl(allBtns[i]);clicked=true;await sleep(600);break;}}
    if(!clicked)break;
  }
  var sels=['.jobs-description-content__text--stretch','.jobs-description-content__text','.jobs-description__content','.jobs-description-content','.jobs-box__html-content','.jobs-description .jobs-box--fadein','[class*="jobs-description-content__text"]','.description__text--rich','#job-details jdiv'];
  for(var k=0;k<sels.length;k++){var el=scope.querySelector(sels[k]);if(el&&el.innerText&&el.innerText.trim().length>40){var t=el.innerText.trim().replace(/\\n{3,}/g,'\\n\\n');if(t.length>40)return t;}}
  return'';
}
async function clickCardGetDesc(card){
  try{
    var link=card.querySelector('a[href*="/jobs/view/"],.job-card-list__title--link,.job-card-container__link');
    clickEl(link||card);
    await sleep(900);
    return await expandAndGetDesc();
  }catch(e){return'';}
}
async function run(){
  running=true;jobs=[];pages=0;logEl.innerHTML='';
  var cat=gid('ljs-cat').value.trim()||'General';
  var withDesc=gid('ljs-desc').checked;
  gid('ljs-start').style.display='none';
  gid('ljs-stop').style.display='block';
  gid('ljs-save-wrap').style.display='none';
  gid('ljs-open-wrap').style.display='none';
  log('Category: "'+cat+'" | Descriptions: '+(withDesc?'ON (slower)':'OFF (fast)'));
  var isSingle=/\\/jobs\\/view\\/\\d+/.test(location.href);
  if(isSingle){
    log('Single job page — extracting...');
    await sleep(300);
    var desc=await expandAndGetDesc();
    var m2=location.href.match(/\\/jobs\\/view\\/(\\d+)/);
    var jid=m2?m2[1]:String(Date.now());
    var tEl2=document.querySelector('.job-details-jobs-unified-top-card__job-title h1,.topcard__title,.t-24.t-bold');
    var cEl2=document.querySelector('.job-details-jobs-unified-top-card__company-name a,.topcard__org-name-link');
    var lEl2=document.querySelector('.job-details-jobs-unified-top-card__workplace-type,.topcard__flavor--bullet');
    var btext=document.body.textContent||'';
    jobs.push({id:'li_'+jid,title:tEl2?tEl2.textContent.trim():document.title,company:cEl2?cEl2.textContent.trim():'',location:lEl2?lEl2.textContent.trim():'',jobUrl:location.href,workplaceType:/remote/i.test(btext)?'Remote':/hybrid/i.test(btext)?'Hybrid':'On-site',easyApply:/easy apply/i.test(document.body.innerHTML),description:desc,category:cat,metadata:{scrapedAt:Date.now(),sourcePage:location.href}});
    upd();log('Done! 1 job extracted.');
  }else{
    var seen=new Set();var noNew=0;
    for(var pg=0;pg<60&&running;pg++){
      var cards=getCards();var newCards=[];
      for(var ci=0;ci<cards.length;ci++){var basic=extractBasic(cards[ci]);if(basic&&!seen.has(basic.id))newCards.push({card:cards[ci],basic:basic});}
      if(newCards.length===0){noNew++;if(noNew>=4)break;log('Page '+(pg+1)+': scrolling...');window.scrollBy(0,900);await sleep(1400);continue;}
      noNew=0;log('Page '+(pg+1)+': '+newCards.length+' jobs'+(withDesc?' (reading desc...)':''));
      for(var j2=0;j2<newCards.length&&running;j2++){
        var item=newCards[j2];if(seen.has(item.basic.id))continue;seen.add(item.basic.id);
        var jobObj=Object.assign({},item.basic,{category:cat});
        if(withDesc){jobObj.description=await clickCardGetDesc(item.card);log('('+(j2+1)+'/'+newCards.length+') '+item.basic.title.slice(0,28));}
        jobs.push(jobObj);upd();
      }
      pages=pg+1;upd();
      if(!withDesc){window.scrollBy(0,900);await sleep(1400);}
      var nextBtn=document.querySelector('button[aria-label="View next page"],button[aria-label="Next"],.artdeco-pagination__button--next');
      if(nextBtn&&!nextBtn.disabled){nextBtn.click();await sleep(withDesc?1800:2000);}
    }
  }
  running=false;
  gid('ljs-stop').style.display='none';
  gid('ljs-start').style.display='block';
  gid('ljs-start').textContent=jobs.length>0?'\\u25B6 Scrape Again':'\\u25B6 Start Scraping';
  if(jobs.length>0){gid('ljs-save-wrap').style.display='block';log('\\u2713 Done! '+jobs.length+' jobs ready. Click Save.');}
  else{log('No jobs found. Go to a LinkedIn jobs page first.');}
}
async function save(){
  var btn=gid('ljs-save');btn.textContent='Saving...';btn.disabled=true;
  log('Sending '+jobs.length+' jobs...');
  try{
    var res=await fetch(APP+'/api/jobs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jobs:jobs})});
    var d=await res.json();
    if(d.count!==undefined){log('\\u2713 Saved '+d.count+' new!'+(d.skipped?' ('+d.skipped+' dups skipped)':''));btn.textContent='\\u2713 Saved!';btn.disabled=false;gid('ljs-open-wrap').style.display='block';return;}
    throw new Error(d.error||'Unknown error');
  }catch(e){
    log('Trying redirect method...');
    try{window.name=JSON.stringify({source:'li-scraper',jobs:jobs});setTimeout(function(){window.location.href=APP+'/dashboard?import=1';},700);}
    catch(e2){log('Error: '+e2.message);btn.textContent='Try Again';btn.disabled=false;btn.onclick=save;}
  }
}
gid('ljs-close').onclick=function(){host.remove();};
gid('ljs-start').onclick=run;
gid('ljs-stop').onclick=function(){running=false;log('Stopped.');};
gid('ljs-save').onclick=save;
gid('ljs-open').onclick=function(){window.open(APP+'/dashboard','_blank');};
log('Ready! Set your category name above, then click Start Scraping.');
log('Tip: click bookmark again anytime — no page refresh needed!');
})()`;
}