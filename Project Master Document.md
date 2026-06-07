# Project Master Document

**LinkedIn Job Information Scraper**

| Field | Value |
|-------|-------|
| **Repository** | [github.com/siddharthurankar/linkedin-job-information-scraper](https://github.com/siddharthurankar/linkedin-job-information-scraper) |
| **Primary surface** | Web app (`apps/web`) — bookmarklet + dashboard |
| **Platform origin** | Built and deployable via [Anything.com](https://anything.com) |
| **Last documented** | May 2026 |
| **Author** | Siddharth Urankar |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Thinking](#2-product-thinking)
3. [Technical Architecture](#3-technical-architecture)
4. [AI/ML Details](#4-aiml-details)
5. [Engineering Details](#5-engineering-details)
6. [Resume Optimization](#6-resume-optimization)
7. [LinkedIn Content](#7-linkedin-content)
8. [Interview Preparation](#8-interview-preparation)
9. [Portfolio Documentation](#9-portfolio-documentation)
10. [Missing Information Audit](#10-missing-information-audit)

---

# 1. Executive Summary

## Project Name

**LinkedIn Job Information Scraper** (formerly branded "LinkedIn Job Intelligence" / "Smart LinkedIn Job Intelligence")

## One-Sentence Pitch

A privacy-first LinkedIn job scraper with a personal dashboard, ATS keyword extraction, and optional bring-your-own-key Gemini resume matching — no extension store required.

## Elevator Pitch (30 seconds)

Job seekers waste hours copying LinkedIn listings into spreadsheets and guessing which roles fit their background. LinkedIn Job Information Scraper fixes that with a one-click bookmarklet: scrape titles, companies, locations, full job descriptions (including "Show more" content), and top-10 keywords into a searchable dashboard. Organize batches by custom collections like "Tech Jobs" or "Finance." Optionally score each role against your resume using your own Google Gemini API key — the key and resume never leave your browser. Export to CSV, JSON, or Excel and apply smarter, not harder.

## Long Description

LinkedIn Job Information Scraper is a full-stack web application designed for active job seekers applying across multiple role clusters (software, data, product, business, etc.). The product has two tightly coupled halves:

1. **In-browser scraper (bookmarklet)** — Runs on `linkedin.com/jobs` when the user clicks a saved bookmark. It injects a floating control panel (Shadow DOM + DOM APIs to survive LinkedIn's HTML sanitization), lets the user name a collection before scraping, optionally expands each job's full description by programmatically clicking "Show more" / "See more," paginates results, and POSTs structured job objects to the app's REST API.

2. **Personal job intelligence dashboard** — A React SPA at `/dashboard` with Overview, Jobs, Analytics, and Settings tabs. Jobs persist in **Neon Postgres** (cloud PostgreSQL). Server-side logic extracts the top 10 weighted keywords per job, classifies experience level and role category, and stores metadata. Optional **Gemini 2.0 Flash** scoring compares the user's resume to each job description client-side; results (0–100 match score, reasoning, skill gaps) are saved back via PATCH. Sensitive credentials (Gemini API key, resume text) stay in **browser localStorage only**.

The product was originally scaffolded on Anything.com (low-code / AI app builder) and evolved through iterative user feedback: fixing fake AI scores, LinkedIn-specific bookmarklet breakage, filter reliability, Excel export, category/collection support, and honest BYOK AI integration.

## Problem Statement

LinkedIn's native job search UI is optimized for discovery, not for systematic application workflows. Users who apply to dozens or hundreds of roles need:

- **Structured data** (title, company, location, workplace type, full description) in one place
- **Batch organization** by search intent (e.g., "New Grad SWE" vs. "PM Internships")
- **Signal extraction** — which keywords actually matter for ATS and tailoring
- **Fit assessment** — how well their resume matches each posting
- **Export** to Excel/CSV for tracking and offline analysis

Existing tools are often extensions with store friction, paid SaaS with opaque scoring, or manual copy-paste workflows.

## Why This Problem Matters

- **Volume hiring** — Tech and business grads routinely apply to 50–300+ roles per cycle.
- **ATS friction** — Missing 2–3 critical keywords can auto-reject otherwise qualified candidates.
- **Time cost** — Reading truncated LinkedIn previews and expanding each posting manually is slow.
- **Trust** — Fake or heuristic "AI match scores" without a resume erode product credibility.
- **Privacy** — Job search data and resumes are sensitive; users resist sending them to unknown servers.

## Target Users

| Segment | Need |
|---------|------|
| **New grads / career switchers** | High-volume scraping, keyword visibility, collection-based organization |
| **Software engineers** | Full descriptions, tech keyword extraction, optional resume fit scoring |
| **Data / AI engineers** | Same + interest in LLM integration patterns (BYOK) |
| **Business / PM / analyst applicants** | Multi-cluster searches, Excel export, filters by workplace and experience |
| **Privacy-conscious users** | Local API key storage, direct browser-to-Google Gemini calls |

## Pain Points Solved

| Pain | Solution |
|------|----------|
| Truncated job descriptions | Auto-click "Show more" before extraction |
| Manual spreadsheet work | One-click scrape → dashboard → export |
| No way to group searches | User-defined **Collection** per scrape batch |
| Misleading AI scores | Removed server-side fake match %; real Gemini scoring only with user key + resume |
| Bookmarklet breaks on LinkedIn | Shadow DOM + `createElement` UI (LinkedIn strips `&` from `innerHTML`) |
| Re-run bookmark without refresh | Remove old panel host on each click (`li-scraper-host`) |
| Filter gaps (New Grad, Other, Collections) | Rewritten Jobs tab filter logic |

## Value Proposition

**For job seekers:** Turn LinkedIn browsing into a personal, searchable, exportable job CRM with honest optional AI fit scoring — free to self-host except your own Gemini usage.

**Differentiators:** Bookmarklet (no Chrome Web Store), BYOK Gemini (zero server-side resume/key exposure for scoring), weighted keyword extraction tuned for job descriptions, collection-based batching.

## Market Need

The job search tooling market includes browser extensions (Simplify, Teal, Huntr), ATS optimizers (Jobscan), and spreadsheet-first trackers. There is demand for:

- Lightweight, no-install scraping
- Transparent AI (user-owned keys)
- Full description capture
- Excel-native workflows

This product occupies the intersection of **scraper + dashboard + optional LLM fit analysis** without mandatory subscription.

---

# 2. Product Thinking

## User Personas

### Persona 1: "Volume Applicant Priya"
- **Profile:** CS new grad, 100+ applications/semester
- **Goals:** Capture every relevant posting, export to Excel, track by company
- **Behavior:** Runs broad LinkedIn searches, scrapes nightly, filters Remote + New Grad
- **Success metric:** Jobs scraped per hour, duplicate skip rate, export completeness

### Persona 2: "Career Pivot Marcus"
- **Profile:** Business analyst → product manager transition
- **Goals:** Separate collections for BA vs PM roles, keyword tailoring
- **Behavior:** Names collections before scrape, reads top-10 keywords, edits resume per cluster
- **Success metric:** Keyword overlap improvement, interview rate (external)

### Persona 3: "Privacy-First Dev Elena"
- **Profile:** Senior engineer, skeptical of SaaS resume upload
- **Goals:** Real match scores without sending resume to a startup's server
- **Behavior:** Adds Gemini key in Settings, uploads PDF locally, scores top 20 jobs only
- **Success metric:** Trust, cost control, gap list accuracy

### Persona 4: "Anything.com Builder Siddharth" (founder/user)
- **Profile:** Built app on Anything, deploys via Publish, syncs code across machines
- **Goals:** Ship features fast, debug LinkedIn-specific edge cases, portfolio piece
- **Pain:** Copy-paste between machines breaks bookmarklet; DATABASE_URL setup for local dev

## User Journeys

### Journey A: First-Time Setup
1. Visit app home `/` on deployed Anything URL or localhost
2. Drag "Scrape LinkedIn Jobs" bookmarklet to bookmarks bar (or copy `javascript:` code)
3. Open `/dashboard` — verify empty state or load `/dashboard/demo`
4. (Optional) Settings → add Gemini key + resume → enable scoring

### Journey B: Scrape → Save → Analyze
1. LinkedIn Jobs search results (`linkedin.com/jobs/search/...`)
2. Click bookmarklet → panel appears (Shadow DOM)
3. Enter collection name (e.g., "Backend Remote Q1")
4. Toggle "Include full descriptions" (default ON)
5. Start Scraping → pagination → job count updates
6. Save to Dashboard → POST `/api/jobs`
7. Open Dashboard → filter by collection → expand row for keywords/description
8. (Optional) Score jobs with Gemini

### Journey C: Export for Application Tracking
1. Jobs tab → filter/sort → select rows or export all filtered
2. Export modal → CSV / JSON / XLSX with Top 10 Keywords column
3. Open in Excel → track status offline

## User Workflow (Step-by-Step)

```
[LinkedIn Jobs Page]
       │
       ▼
[Click Bookmarklet] ──► Inject panel (li-scraper-host + Shadow DOM)
       │
       ▼
[Enter Collection + Options]
       │
       ▼
[Start Scraping]
   ├── For each page of results:
   │     ├── Find job cards (data-occludable-job-id, etc.)
   │     ├── extractBasic(card) → title, company, location, id
   │     └── If full descriptions ON:
   │           ├── Click card / job link
   │           ├── expandAndGetDesc() → click "Show more" (up to 3 passes)
   │           └── Extract text from detail pane selectors
   └── Paginate until stop or no next page
       │
       ▼
[Save to Dashboard] ──► POST { jobs: [...] } to APP/api/jobs
       │                    │
       │                    ▼
       │              [Server: analyzeJob + extractKeywords + INSERT]
       │
       ▼
[Dashboard /dashboard]
   ├── Overview: totals, avg Gemini match, workplace split
   ├── Jobs: search, filters, sort, score, notes, export
   ├── Analytics: charts (companies, skills, score ranges)
   └── Settings: Gemini key, resume, export prefs, delete all
```

## User Stories

| ID | Story | Acceptance |
|----|-------|------------|
| US-01 | As a user, I want to scrape full job descriptions including hidden text | "Show more" clicked; description length > card preview |
| US-02 | As a user, I want to label a scrape batch before starting | Collection field saved on each job |
| US-03 | As a user, I want top-10 keywords per job without AI | Keywords column populated server-side on ingest |
| US-04 | As a user, I want filters for workplace, experience, Easy Apply, role, collection | All filter combinations return correct subsets |
| US-05 | As a user, I want to export to Excel with keywords | XLSX/CSV includes Top 10 Keywords column |
| US-06 | As a user, I want honest match scores | No score shown until Gemini key + resume + explicit score |
| US-07 | As a user, I want my API key to stay local | Key in localStorage only; scoring fetch goes to Google |
| US-08 | As a user, I want to re-click bookmark without page refresh | Old panel removed; new panel mounts |
| US-09 | As a user, I want Save to keep LinkedIn open | Dashboard opens in new tab (target behavior — see audit) |
| US-10 | As a user, I want to score all unscored jobs in batch | "Score all unscored" with rate limiting (~400ms between calls) |

## Edge Cases

| Edge Case | Handling / Status |
|-----------|-------------------|
| LinkedIn strips `&` in innerHTML | Fixed: DOM `createElement` + Shadow DOM |
| LinkedIn DOM selector changes | Multiple fallback selectors for cards and descriptions |
| CORS blocks fetch from LinkedIn to API | Fallback: redirect with `window.name` or postMessage (partially implemented) |
| Popup blocked on Save | User must allow pop-ups for linkedin.com |
| PDF resume is image-only | Error: "Could not read text from this PDF" |
| Job without description | Keywords from title; Gemini scores using metadata only |
| Duplicate job IDs | `ON CONFLICT (id) DO UPDATE` — merge description/keywords |
| Old fake heuristic scores in DB | Hidden unless `ai_reasoning` JSON has `source: "gemini"` |
| Scrape on non-jobs LinkedIn page | "No jobs found" log message |
| Gemini rate limits / billing | Error banner on Jobs tab; user enables billing in Google AI Studio |
| Missing DATABASE_URL locally | API 500; dashboard empty; Settings still works |
| Copy-paste wrong file to dashboard/page.jsx | White screen / broken app — restore from repo |

## Competitive Advantages

1. **No extension store** — Bookmarklet works in Chrome, Firefox, Safari
2. **BYOK Gemini** — Real LLM fit analysis without vendor lock-in or resume upload to server
3. **Full description capture** — Explicit expand-before-extract pipeline
4. **Collection-first UX** — User-defined batch labels, not AI-guessed categories only
5. **Weighted keyword engine** — Required/must-have terms 3×, title terms 2×
6. **Open source path** — GitHub repo for portfolio and self-hosting

## Similar Products / Competitors

| Product | Overlap | Gap vs. This Project |
|---------|---------|----------------------|
| **Teal / Huntr / Simplify** | Job tracking, autofill | Often extension/SaaS; opaque AI |
| **Jobscan** | Resume ↔ JD matching | Paid; resume uploaded to vendor |
| **LinkedIn Premium** | Insights, Easy Apply | No bulk export/scrape; no custom collections |
| **Instant Data Scraper / Apify** | Generic scraping | No job-specific dashboard/keywords/Gemini |
| **LinkedIn BS Filter (concept)** | Gemini on LinkedIn feed | Different surface — feed posts vs jobs |

## SWOT Analysis

| | |
|--|--|
| **Strengths** | End-to-end pipeline; honest AI opt-in; keyword extraction; Anything.com rapid deploy; full-stack portfolio story |
| **Weaknesses** | LinkedIn ToS risk; brittle DOM selectors; bookmarklet UX friction; save-in-new-tab still flaky in some browsers; README/docs drift (IndexedDB vs Postgres) |
| **Opportunities** | Chrome extension (BS Filter); OAuth; multi-user; job application status tracking; cover letter generation |
| **Threats** | LinkedIn anti-scraping changes; API key abuse perception; competitor extensions with polish; platform dependency on Anything.com |

---

# 3. Technical Architecture

## Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                                     │
│  ┌──────────────────────┐    ┌────────────────────────────────────────┐ │
│  │ linkedin.com/jobs    │    │ App origin (Anything / localhost)       │ │
│  │                      │    │  ┌─────────────┐  ┌──────────────────┐  │ │
│  │  Bookmarklet         │───►│  │ Dashboard   │  │ localStorage     │  │ │
│  │  (Shadow DOM panel)  │    │  │ React SPA   │  │ - geminiApiKey   │  │ │
│  │                      │    │  │ Zustand     │  │ - resumeText     │  │ │
│  └──────────┬───────────┘    │  └──────┬──────┘  └────────┬─────────┘  │ │
│             │ POST /api/jobs  │         │                   │            │ │
│             └────────────────►│  ┌──────▼──────┐            │            │ │
│                               │  │ API Routes  │            │            │ │
│                               │  │ (Hono/RR7)  │            │            │ │
│                               │  └──────┬──────┘            │            │ │
│                               │         │                   │            │ │
│                               │  Score: │                   ▼            │ │
│                               │         │         fetch(generativelanguage │ │
│                               │         │              .googleapis.com)   │ │
│                               └─────────┼──────────────────────────────────┘ │
└─────────────────────────────────────────┼──────────────────────────────────┘
                                          │
                                          ▼
                               ┌─────────────────────┐
                               │ Neon Postgres       │
                               │ table: linkedin_jobs│
                               └─────────────────────┘
```

## Frontend Technologies

| Layer | Technology |
|-------|------------|
| Framework | React 18 |
| Routing | React Router 7 (`react-router dev`) |
| Build | Vite 6 |
| State | Zustand (`useJobStore`) |
| Styling | Tailwind CSS 3/4 |
| Icons | Lucide React |
| Charts | Recharts (Analytics tab) |
| PDF parsing | pdfjs-dist (client-side resume upload) |
| Export | xlsx (SheetJS), custom CSV with UTF-8 BOM |

## Backend Technologies

| Layer | Technology |
|-------|------------|
| API | React Router / Hono server routes (`src/app/api/`) |
| Database driver | `@neondatabase/serverless` |
| SQL | Tagged template + parameterized queries |
| Auth scaffold | `@auth/core`, `@hono/auth-js` (present; not central to job flow) |
| Hosting | Anything.com publish (primary); local `npm run dev` |

## Database Structure

**Provider:** Neon (serverless PostgreSQL)  
**Connection:** `process.env.DATABASE_URL`

**Table: `linkedin_jobs`** (inferred from INSERT/SELECT in `api/jobs/route.js`)

| Column | Type (inferred) | Purpose |
|--------|-----------------|---------|
| `id` | TEXT PK | Job ID e.g. `li_{linkedinJobId}` |
| `title` | TEXT | Job title |
| `company` | TEXT | Company name |
| `company_url` | TEXT | Company LinkedIn URL |
| `job_url` | TEXT | View job URL |
| `location` | TEXT | Location string |
| `workplace_type` | TEXT | Remote / Hybrid / On-site / Unknown |
| `employment_type` | TEXT | Full-time, etc. |
| `date_posted` | TEXT/TIMESTAMP | Posted date |
| `applicant_count` | TEXT | Applicant info if scraped |
| `easy_apply` | BOOLEAN | Easy Apply flag |
| `description` | TEXT | Full job description |
| `salary` | TEXT | If available |
| `skills` | ARRAY/TEXT[] | Extracted skill terms |
| `match_score` | INTEGER | Gemini score 0–100 (null until scored) |
| `experience_level` | TEXT | Internship / New Grad / Entry / Mid / Senior / Lead |
| `role_category` | TEXT | Software / AI / Data / Product / Business / Research |
| `difficulty` | TEXT | Easy / Medium / Hard |
| `tags` | ARRAY | Tech keyword tags |
| `ai_reasoning` | TEXT | Plain text or JSON `{source:"gemini", reasoning, missingGaps, scoredAt}` |
| `source_page` | TEXT | LinkedIn search URL |
| `scraped_at` | BIGINT | Unix ms timestamp |
| `collection` | TEXT | User-defined batch label |
| `keywords` | ARRAY | Top 10 weighted keywords |
| `notes` | TEXT | User notes (PATCH) |
| `is_saved` | BOOLEAN | Saved flag (PATCH) |

## APIs Used

### Internal REST API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/jobs` | List jobs (search, workplace, collection filters; limit/offset) |
| POST | `/api/jobs` | Bulk insert/update scraped jobs |
| DELETE | `/api/jobs` | Clear all jobs |
| DELETE | `/api/jobs/:id` | Delete one job |
| PATCH | `/api/jobs/:id` | Update notes, collection, isSaved, matchScore, aiReasoning |
| OPTIONS | `*` | CORS preflight (`Access-Control-Allow-Origin: *`) |

### External API

| Service | Endpoint | Purpose |
|---------|----------|---------|
| Google Gemini | `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent` | Resume–job match scoring (client-side, user API key) |

## LLM Integration

- **Model:** `gemini-2.0-flash`
- **Invocation:** Browser `fetch` from dashboard (never proxied through app server for scoring)
- **Config:** `responseMimeType: application/json`, `temperature: 0.2`
- **Output schema:** `{ matchScore: 0-100, reasoning: string, missingGaps: string[] }`
- **Persistence:** PATCH job with `matchScore` + serialized `aiReasoning`
- **Gate:** UI shows scores only when `scoredWithGemini === true` and settings have key + resume

## Browser Extension Architecture

**Current production path:** Bookmarklet in `page.jsx` → `buildBookmarklet(appUrl)`.

**Planned / reference:** `public/manifest.json` defines Manifest V3 extension (content script on `linkedin.com`, storage, tabs). Extension pages exist at `/extension` but full extension packaging is documentation/reference — primary UX is bookmarklet.

**Planned Phase 2 — LinkedIn BS Filter:**
- Separate Chrome extension content script on LinkedIn feed
- MutationObserver on post cards
- Reuse Gemini key from shared settings pattern
- Inject bullet summaries + "Show Original" toggle

## Authentication Flow

- **Job scraping/storage:** No user auth required in current flow; single-tenant per deployed instance
- **Auth modules present:** `@auth/core`, token routes — not wired into job CRUD path
- **Gemini:** User's Google API key (not OAuth); pasted in Settings

## Resume Upload Handling

1. User pastes text or uploads `.txt` / `.pdf` in Settings
2. `extractResumeText(file)` in `dashboard/utils/resume.js`
3. PDF → `extractTextFromPDF` via `client-integrations/pdfjs.js`
4. Text stored in `localStorage` key `liJobResume`
5. Settings metadata (minus resume) in `localStorage` key `liJobSettings`
6. Never sent to app server during scoring — only passed in Gemini prompt from browser

## Job Scraping Workflow

1. **Mount panel** — Remove `#li-scraper-host` if exists; attach Shadow DOM
2. **Configure** — Category, include-full-descriptions checkbox
3. **getCards()** — Query multiple LinkedIn list selectors
4. **extractBasic(card)** — Job ID from `data-occludable-job-id` or URL regex
5. **clickCardGetDesc(card)** — Click job link; wait ~900ms; `expandAndGetDesc()`
6. **expandAndGetDesc()** — Scope to detail pane; up to 3 passes clicking "Show more" buttons; extract from description selectors
7. **Dedupe** — Track seen IDs in scrape session
8. **Paginate** — Click next page button; increment page counter
9. **Save** — POST JSON array to `/api/jobs`

## AI Scoring Methodology

1. User enables scoring in Settings (`geminiScoringEnabled`)
2. `canScore(settings)` requires non-empty `geminiApiKey` and `resumeText`
3. Per job: `scoreJobWithGemini(key, resume, job)` builds career-coach prompt
4. Resume truncated to 14,000 chars; description to 12,000 chars
5. Model returns JSON; validated and clamped 0–100
6. `updateJobGeminiScore` → PATCH + Zustand update
7. Batch: `scoreUnscoredJobs` sequential with 400ms delay

**Legacy (removed for honesty):** Server `analyzeJob()` used to add fake `matchScore` via keyword heuristics (+10 React, +6 Python, etc.). Now `match_score` and `ai_reasoning` inserted as `null` on ingest.

## Data Flow (End to End)

```
LinkedIn DOM
  → bookmarklet extract
  → POST /api/jobs
  → analyzeJob() + extractKeywords()
  → Neon INSERT
  → GET /api/jobs
  → Zustand store
  → React tabs (Overview/Jobs/Analytics)
  → [optional] Gemini client score
  → PATCH /api/jobs/:id
  → Export CSV/JSON/XLSX
```

## Security Considerations

| Area | Status |
|------|--------|
| API key storage | Client localStorage — XSS on app origin would expose key |
| CORS | `Access-Control-Allow-Origin: *` on jobs API — intentional for bookmarklet cross-origin POST |
| SQL injection | Parameterized queries via Neon client |
| Secrets in repo | `.env` with DATABASE_URL must not be committed |
| LinkedIn scraping | Violates LinkedIn ToS — user assumes risk |
| Gemini key in URL | Key passed as query param to Google (Google's standard pattern) |

## Privacy Considerations

- **Stored on server:** Scraped public job listings, keywords, Gemini scores/reasoning (if user scores)
- **Never on server:** Gemini API key, raw resume text
- **Browser-only:** Resume + key in localStorage
- **Scoring path:** Browser → Google directly

## Scalability Considerations

- Neon serverless handles moderate single-user load
- GET limit default 3000 jobs
- Batch Gemini scoring is sequential (rate limit friendly, slow for 500+ jobs)
- No multi-tenant isolation — one DB per deployment
- Bookmarklet pagination unbounded — memory grows with session job array

## Deployment Strategy

1. **Anything.com (primary):** Publish from project; DATABASE_URL auto-provisioned (Neon)
2. **Local dev:** `cd apps/web && npm install && npm run dev` — requires manual DATABASE_URL in `.env`
3. **GitHub:** Source of truth at [linkedin-job-information-scraper](https://github.com/siddharthurankar/linkedin-job-information-scraper)
4. **Bookmarklet APP URL:** Set from `window.location.origin` at runtime on home page

---

# 4. AI/ML Details

## Models Used

| Use Case | Model | Where |
|----------|-------|-------|
| Resume–job match | `gemini-2.0-flash` | Client → Google Generative Language API |
| Keyword extraction | Rule-based / statistical | Server `extractKeywords()` |
| Job classification | Rule-based heuristics | Server `analyzeJob()` |

## Prompt Engineering Approaches

**Gemini scoring prompt (`dashboard/utils/gemini.js`):**
- Role: "You are a career coach"
- Strict JSON schema output (no markdown)
- Rules: score 0–100; up to 5 concrete gaps; evidence-only from resume (no assumed skills)
- Structured job metadata: title, company, location, workplace, description
- Fallback text if no description scraped

**Generation config:**
- `responseMimeType: application/json`
- `temperature: 0.2` (low variance for scoring consistency)

## Resume–Job Matching Methods

| Method | Type | When Used |
|--------|------|-----------|
| Gemini semantic comparison | LLM | User opt-in with key + resume |
| Weighted keyword overlap | Heuristic | Always on ingest (keywords column) |
| Tag matching | Keyword list filter | `analyzeJob` tech tag detection |

## Feature Extraction

**From job text (server):**
- Experience level keywords (intern, new grad, senior, staff, etc.)
- Role category (ML, data, PM, business, research)
- Tech tag list (~50 terms: React, Python, AWS, etc.)
- Top 10 keywords with weighting

**From resume (client, for Gemini only):**
- Full plain text (PDF or paste)
- Truncated to 14k chars in prompt

## Keyword Extraction

Algorithm in `extractKeywords(title, description)`:
1. Lowercase corpus = title + description
2. Remove stop words (~80 terms)
3. Regex tokenize `\b([a-z][a-z+#.\-/]{2,})\b`
4. **+3 weight** for tokens within 40 chars of required/must/mandatory/essential
5. **+2 weight** for tokens appearing in title
6. Sort by count; dedupe substrings; return top 10

## Semantic Matching Methods

- **Primary:** Gemini 2.0 Flash full-text comparison (resume vs JD)
- **Not implemented:** Embeddings, vector DB, cosine similarity

## Skill Gap Analysis

- Gemini returns `missingGaps[]` (max 5 strings)
- Displayed in Jobs tab expanded row: "Gaps vs your resume"
- Stored inside `ai_reasoning` JSON blob

## Scoring Algorithms

**Gemini (primary honest score):**
- Integer 0–100 from model; rounded and validated

**Legacy heuristic (deprecated, hidden in UI):**
- Base 58 + bonuses for react/javascript/typescript, python/node, seniority, easy apply, remote
- Capped at 99 — **no longer written on ingest**

## Ranking Methods

- Jobs table sort by: scraped date, title, company, **Gemini match %** (when available)
- Keywords sorted by weighted frequency
- Analytics: score range buckets, top companies, top skills

## Evaluation Metrics

| Metric | Definition |
|--------|------------|
| Scrape yield | Jobs found per session / per page |
| Description completeness | % jobs with description length > 200 chars |
| Keyword coverage | Non-empty keywords array rate |
| Score coverage | % jobs with `scoredWithGemini` |
| Duplicate skip rate | POST response `skipped` count |
| Export success | User completes CSV/XLSX download |

*No formal ML evaluation dataset exists yet — see audit section.*

---

# 5. Engineering Details

## Folder Structure

```
anything/
├── README.md
├── Project Master Document.md          ← this file
└── apps/web/
    ├── package.json
    ├── .env                            ← DATABASE_URL (not committed)
    ├── public/manifest.json            ← Extension manifest (reference)
    ├── src/
    │   ├── app/
    │   │   ├── page.jsx                ← Home + bookmarklet builder
    │   │   ├── guide/page.jsx
    │   │   ├── extension/page.jsx
    │   │   ├── dashboard/
    │   │   │   ├── page.jsx            ← Dashboard shell + import
    │   │   │   ├── demo/page.jsx
    │   │   │   ├── store.js            ← Zustand
    │   │   │   ├── components/
    │   │   │   │   ├── OverviewTab.jsx
    │   │   │   │   ├── JobsTab.jsx
    │   │   │   │   ├── AnalyticsTab.jsx
    │   │   │   │   ├── SettingsTab.jsx
    │   │   │   │   └── ExportModal.jsx
    │   │   │   └── utils/
    │   │   │       ├── ai.js
    │   │   │       ├── gemini.js
    │   │   │       ├── scoreDisplay.js
    │   │   │       ├── resume.js
    │   │   │       ├── export.js
    │   │   │       ├── scraper.js
    │   │   │       └── db.js           ← legacy/reference IndexedDB
    │   │   └── api/
    │   │       ├── jobs/route.js
    │   │       ├── jobs/[id]/route.js
    │   │       └── utils/sql.js
    │   └── client-integrations/pdfjs.js
```

## Major Modules

| Module | Responsibility |
|--------|----------------|
| `page.jsx` | Landing, bookmarklet generation, setup UX |
| `store.js` | Jobs CRUD, settings, Gemini score actions |
| `api/jobs/route.js` | Persistence, keyword extraction, job analysis |
| `gemini.js` | LLM prompt, parse, API call |
| `scoreDisplay.js` | Honest UI gating for scores |
| `JobsTab.jsx` | Table, filters, score buttons, expand rows |
| `ExportModal.jsx` | CSV/JSON/XLSX with keyword column |

## Key Functions

| Function | File | Purpose |
|----------|------|---------|
| `buildBookmarklet(appUrl)` | page.jsx | Generates IIFE bookmarklet string |
| `extractKeywords(title, desc)` | api/jobs/route.js | Top-10 weighted keywords |
| `analyzeJob(job)` | api/jobs/route.js | Experience, category, tags, difficulty |
| `dbToJob(row)` | api/jobs/route.js | SQL row → frontend shape |
| `scoreJobWithGemini()` | gemini.js | Client LLM call |
| `getDisplayMatchScore()` | scoreDisplay.js | Hide non-Gemini scores |
| `extractResumeText()` | resume.js | PDF/txt → plain text |
| `calculateOverallStats()` | ai.js | Overview analytics |

## Key Components

| Component | Tab | Features |
|-----------|-----|----------|
| OverviewTab | Overview | Total jobs, companies, avg match, workplace chart, recent jobs |
| JobsTab | Jobs | Search, 5 filters, sort, pagination, score, notes, keywords pills |
| AnalyticsTab | Analytics | Recharts: companies, skills, locations, score distribution |
| SettingsTab | Settings | Gemini key, resume, scoring toggle, export prefs, delete all |
| ExportModal | Modal | Format selection, column toggles, keywords highlight |

## Database Schema (SQL Reference)

```sql
-- Inferred; initial migration likely created via Anything.com
CREATE TABLE linkedin_jobs (
  id TEXT PRIMARY KEY,
  title TEXT,
  company TEXT,
  company_url TEXT,
  job_url TEXT,
  location TEXT,
  workplace_type TEXT,
  employment_type TEXT,
  date_posted TEXT,
  applicant_count TEXT,
  easy_apply BOOLEAN,
  description TEXT,
  salary TEXT,
  skills TEXT[],
  match_score INTEGER,
  experience_level TEXT,
  role_category TEXT,
  difficulty TEXT,
  tags TEXT[],
  ai_reasoning TEXT,
  source_page TEXT,
  scraped_at BIGINT,
  collection TEXT,
  keywords TEXT[],
  notes TEXT,
  is_saved BOOLEAN DEFAULT FALSE
);
```

## Pseudocode

**Bookmarklet scrape loop:**
```
removeOldPanel()
mountShadowPanel()
onStart:
  for each page:
    cards = querySelectors(FALLBACK_SELECTORS)
    for card in cards:
      basic = extractBasic(card)
      if withDescriptions: basic.description = clickCardGetDesc(card)
      jobs.push(basic)
    clickNextPage()
onSave:
  POST APP/api/jobs { jobs }
```

**Gemini score:**
```
prompt = careerCoachTemplate(resume[0:14000], job)
response = POST generativelanguage.googleapis.com/.../gemini-2.0-flash:generateContent
parsed = JSON.parse(response.text)
PATCH /api/jobs/:id { matchScore, aiReasoning: JSON.stringify({source:'gemini',...}) }
```

## Implementation Challenges

1. LinkedIn DOM volatility — selectors break without warning
2. LinkedIn HTML sanitization — innerHTML entity stripping
3. Cross-origin save from LinkedIn — CORS vs bookmarklet POST
4. Popup / new tab timing — user gesture expiration after async fetch
5. Copy-paste deployment between machines — broken bookmarklet strings
6. README vs implementation drift — IndexedDB documented, Postgres actual

## Technical Tradeoffs

| Decision | Pro | Con |
|----------|-----|-----|
| Bookmarklet vs extension | Zero install | Fragile on DOM changes; no background permissions |
| BYOK Gemini | Privacy, zero API cost to operator | UX friction; user must enable billing |
| Server keywords vs LLM keywords | Free, fast, deterministic | Less semantic than embeddings |
| Neon Postgres vs IndexedDB | Cross-device sync on same deployment | Requires DATABASE_URL for local dev |
| CORS `*` | Bookmarklet can POST | Any origin can write if URL known |

## Alternative Approaches

| Approach | Notes |
|----------|-------|
| Official LinkedIn API | Restricted; not viable for job seeker scraping |
| Server-side Gemini proxy | Simpler UX but resume/key pass through server — rejected |
| Embeddings + vector search | Better scale for 1000+ jobs; higher complexity |
| Playwright server scraper | Violates ToS more aggressively; needs infra |
| Chrome extension only | Better DOM access; store approval friction |

---

# 6. Resume Optimization

## 10 General Resume Bullet Points (with metrics placeholders)

1. Built **LinkedIn Job Information Scraper**, a full-stack job intelligence platform combining a Shadow DOM bookmarklet, React dashboard, and Neon Postgres — enabling structured capture of **500+ job postings** per search cycle with full descriptions and ATS keywords.
2. Engineered a **weighted keyword extraction pipeline** (3× required-term boost, 2× title boost) surfacing the top **10 decision-critical keywords** per posting, exported to CSV/Excel for resume tailoring.
3. Designed **bring-your-own-key Gemini 2.0 Flash integration** scoring resume–job fit (**0–100**) client-side — API keys and resumes never touch the application server.
4. Fixed critical LinkedIn production bug where HTML entity stripping broke bookmarklet UI — migrated from `innerHTML` to **Shadow DOM + createElement**, restoring scraper functionality on linkedin.com.
5. Implemented **collection-based batch ingestion** so users label scrape sessions ("Tech", "Finance", "PM") and filter **100% of jobs** by user-defined clusters in the dashboard.
6. Developed full-description scraping via programmatic **"Show more" expansion** (multi-pass, scoped detail pane selectors), increasing captured description length by an estimated **5–10×** vs card preview alone.
7. Shipped **multi-format export** (CSV with UTF-8 BOM, JSON, XLSX) with dedicated keywords column — supporting Excel-first job search workflows used by **target users applying to 50–300+ roles**.
8. Architected REST API on React Router 7 with **CORS-enabled bulk POST** from cross-origin bookmarklet, upsert deduplication, and PATCH for LLM score persistence.
9. Replaced misleading heuristic "AI scores" with **honest UI gating** — match percentages displayed only after explicit user-triggered Gemini scoring with verified JSON `source: "gemini"`.
10. Deployed via **Anything.com** with Neon serverless Postgres; documented local dev setup reducing onboarding friction for contributors cloning from GitHub.

## 10 Software Engineer Versions

1. Developed a **React 18 + Zustand + Tailwind** dashboard with paginated job table, 6-dimensional filtering, and Recharts analytics serving **3k+ job records** per Neon query.
2. Authored a **684-line bookmarklet generator** producing encoded `javascript:` IIFE with Shadow DOM isolation, resilient to LinkedIn's CSP-adjacent DOM sanitization.
3. Built **React Router 7 API routes** (`GET/POST/DELETE/PATCH /api/jobs`) with parameterized Neon SQL and structured `dbToJob` mapper handling legacy and Gemini JSON reasoning formats.
4. Implemented client-side **PDF resume parsing** via pdfjs-dist for Gemini prompt assembly without server upload.
5. Created Zustand store actions `scoreJob` / `scoreUnscoredJobs` with **400ms inter-request throttle** respecting Gemini free-tier rate limits (~15 RPM).
6. Refactored Jobs tab sort/filter pipeline with `useMemo` over **5 filter dimensions** + keyword/tag/description search — fixing New Grad and Collection edge cases.
7. Integrated **xlsx** export with auto column mapping and UTF-8 BOM CSV for Excel compatibility on Windows.
8. Diagnosed cross-origin **CORS + popup user-gesture** failures between LinkedIn and dashboard — iterated save flows (postMessage, named tabs, mousedown split).
9. Maintained **TypeScript typecheck** pass across React Router 7 hybrid JS/TS codebase with Vite 6 build toolchain.
10. Open-sourced project on GitHub with monorepo structure under `apps/web`, enabling clone-and-run local development with `DATABASE_URL` configuration.

## 10 AI Engineer Versions

1. Integrated **Google Gemini 2.0 Flash** via Generative Language API with `responseMimeType: application/json` for structured resume–job scoring outputs.
2. Designed career-coach **prompt template** enforcing evidence-only scoring, 0–100 integer match, and ≤5 skill gaps — reducing hallucinated qualification assumptions.
3. Built JSON parse pipeline with markdown fence stripping and schema validation (`matchScore`, `reasoning`, `missingGaps`) plus user-facing error recovery.
4. Separated **LLM scoring (client)** from **deterministic keyword extraction (server)** — honest product boundary between free features and BYOK AI.
5. Implemented `serializeGeminiReasoning` / `parseAiReasoning` dual-format storage in Postgres `ai_reasoning` column for backward compatibility.
6. Applied **temperature 0.2** and truncated inputs (resume 14k, description 12k chars) balancing cost, latency, and context window limits.
7. Designed skill gap UI surfacing model output as actionable bullet list — bridging LLM output to job application workflow.
8. Evaluated alternatives: server-side proxy (rejected for privacy), keyword-only fit (kept as free tier), embedding similarity (future work).
9. Planned **Phase 2 LinkedIn BS Filter** — feed post summarization reusing same Gemini key and client-side architecture pattern.
10. Documented prompt rules aligning with recruiter-style fit assessment: role-specific scoring, no inferred skills, explicit handling of missing descriptions.

## 10 Product / Data Analyst Versions

1. Identified user pain — **fake AI match scores without resume** — and shipped BYOK Gemini opt-in, improving trust and feature honesty.
2. Defined **collection-first taxonomy** letting users organize multi-cluster job searches (tech/business/PM) without relying on AI categorization alone.
3. Spec'd **Top 10 Keywords** export column weighted toward required qualifications — primary ATS tailoring signal over generic tag clouds.
4. Mapped end-to-end job seeker workflow: scrape → filter → keyword review → (optional) score → export → apply, across **4 dashboard tabs**.
5. Prioritized full job description capture as **P0 requirement** after user feedback — "Show more" automation before keyword and scoring features.
6. Defined analytics views: workplace distribution, score histograms, top companies/skills — supporting application strategy decisions.
7. Drove filter completeness: added **New Grad**, **Other**, dynamic Collections dropdown from live data — closing "jobs disappear when filtered" bugs.
8. Spec'd privacy messaging in Settings: local key storage, direct Google API calls — reducing friction for privacy-conscious segments.
9. Created `/dashboard/demo` sample dataset for **zero-scrape onboarding** and Gemini scoring demos.
10. Authored user-facing setup flows on home, guide, and settings pages reducing support burden for bookmarklet re-install after code updates.

## ATS Keywords Extracted from Project

`LinkedIn`, `job scraper`, `web scraping`, `bookmarklet`, `React`, `React Router`, `JavaScript`, `TypeScript`, `Zustand`, `Tailwind CSS`, `Vite`, `REST API`, `PostgreSQL`, `Neon`, `full-stack`, `dashboard`, `data export`, `CSV`, `Excel`, `XLSX`, `keyword extraction`, `NLP`, `Google Gemini`, `LLM`, `prompt engineering`, `JSON schema`, `resume matching`, `ATS`, `client-side`, `localStorage`, `CORS`, `Shadow DOM`, `DOM manipulation`, `pdf.js`, `Recharts`, `analytics`, `privacy`, `BYOK`, `Anything.com`, `job search`, `Chrome extension`, `Manifest V3`

## Strongest Impact Statements

- *"Eliminated misleading AI scores and shipped real Gemini resume–job matching with zero server-side resume exposure."*
- *"Restored LinkedIn scraper production reliability by fixing Shadow DOM UI breakage caused by LinkedIn's HTML sanitization."*
- *"Built end-to-end job intelligence pipeline: scrape full descriptions → weighted keywords → optional LLM fit → Excel export."*

---

# 7. LinkedIn Content

## Short Announcement Post

Shipped **LinkedIn Job Information Scraper** — scrape LinkedIn Jobs into your own dashboard with full descriptions, top-10 ATS keywords, and optional Gemini resume matching (your API key stays in your browser). Bookmarklet, no extension store. Open source on GitHub.

🔗 [github.com/siddharthurankar/linkedin-job-information-scraper](https://github.com/siddharthurankar/linkedin-job-information-scraper)

## Medium Storytelling Post

I got tired of two things during job search: copying LinkedIn postings into spreadsheets, and "AI match scores" that never saw my resume.

So I built **LinkedIn Job Information Scraper**.

One bookmark click on LinkedIn Jobs → titles, companies, locations, **full "About the job" text** (yes, including what's hidden behind "Show more"), and the **10 keywords that actually matter** for ATS.

Everything lands in a personal dashboard where I filter by Remote/Hybrid, group searches into collections like "New Grad SWE" vs "PM Roles", and export to Excel.

The part I'm proudest of: **optional Gemini scoring** where *I* bring my own API key. My resume never hits someone else's server. The app doesn't fake a fit percentage — it either shows a real score or tells me to add my key.

Built with React, Neon Postgres, and a bookmarklet that survived LinkedIn breaking my UI (they strip `&` from HTML — fun debug session).

If you're applying at volume and want structure without another subscription, check it out. Link in comments.

## Long Viral-Style Post

**I built a LinkedIn job scraper because LinkedIn doesn't want you to organize your search like a pro.**

Here's the problem nobody talks about:

You're applying to 100+ roles.
LinkedIn shows you 3 lines of a job description.
The "AI" tools want your resume uploaded to their cloud.
And half of them give you a "match score" that means nothing.

So I built **LinkedIn Job Information Scraper**. Here's what it does:

📌 **One-click bookmarklet** — no Chrome Web Store, no install drama
📝 **Full job descriptions** — auto-clicks "Show more" on every posting
🏷️ **Top 10 keywords** — weighted toward "required" and "must have" language
🗂️ **Your categories** — label each scrape "Tech", "Finance", whatever YOU want
📊 **Dashboard** — filter, sort, analytics, notes
📥 **Export to Excel** — because we're still living in spreadsheets and that's OK
🤖 **Real AI matching (optional)** — bring your own Gemini key; resume stays local

The technical war stories:
→ LinkedIn broke my panel by stripping `&` from HTML. Fixed with Shadow DOM.
→ Fake heuristic scores felt wrong. Removed them. Honest UI only.
→ Save-to-dashboard tried to navigate away from LinkedIn. Still fighting browser popup rules.

Open source. Built on React + Postgres. Deployed on Anything.com.

Job search is brutal enough. Your tools shouldn't lie to you.

**GitHub:** [linkedin-job-information-scraper](https://github.com/siddharthurankar/linkedin-job-information-scraper)

If this saves you one hour this week, star the repo ⭐

## Technical Deep Dive Post

**How I built client-side Gemini resume–job scoring without touching the server**

Architecture decisions for LinkedIn Job Information Scraper:

**1. BYOK Gemini (Bring Your Own Key)**
- API key in `localStorage` (`liJobSettings`)
- Resume text separate key (`liJobResume`)
- `scoreJobWithGemini()` calls `generativelanguage.googleapis.com` directly from the browser
- Server only stores the *output* (score + reasoning JSON), never the resume

**2. Honest score gating**
- Server no longer writes fake `match_score` on ingest
- UI uses `isGeminiScore()` + `getDisplayMatchScore()` — returns null unless `source: "gemini"` in stored reasoning

**3. Prompt design**
- Model: `gemini-2.0-flash`
- `responseMimeType: application/json`, temp 0.2
- Explicit rule: "do not assume skills not listed"
- Output: `{ matchScore, reasoning, missingGaps[] }`

**4. Keyword extraction (free tier)**
- Server-side regex + stop word filter
- 3× boost near "required/mandatory"
- 2× boost for title tokens
- Deduped top 10 — no LLM cost

**5. Bookmarklet on LinkedIn**
- Shadow DOM host `#li-scraper-host`
- `createElement` only — LinkedIn mangles `innerHTML` entities

Repo: [github.com/siddharthurankar/linkedin-job-information-scraper](https://github.com/siddharthurankar/linkedin-job-information-scraper)

## Recruiter-Focused Post

Looking for **full-stack / frontend engineers** who ship user-facing tools fast?

I recently built and open-sourced **LinkedIn Job Information Scraper** — a production web app combining:

- DOM scraping & browser automation (bookmarklet)
- React dashboard with complex filtering & data viz
- PostgreSQL (Neon) API design
- LLM integration (Google Gemini, client-side, structured JSON outputs)
- Privacy-conscious architecture (BYOK, no resume upload)

Stack: **React 18, React Router 7, Zustand, Tailwind, Vite, Neon Postgres**

It's the kind of project that mirrors real product work: user feedback loops, breaking third-party platform changes, and balancing "ship fast" with "don't fake AI features."

Happy to walk through architecture decisions. GitHub link on profile / in comments.

## Startup Founder Style Post

**Job search tooling is broken for power users.**

LinkedIn optimizes engagement, not outcomes.
Trackers want your resume in their cloud.
"AI match scores" are often vibes with a percentage attached.

I shipped v1 of **LinkedIn Job Information Scraper** in days using Anything.com, then iterated based on my own job search:

→ Full descriptions matter more than match scores
→ Keywords beat generic tags for ATS
→ Privacy is a feature, not a footnote

Monetization I'm *not* doing (yet): hosting your API calls and charging margin. BYOK keeps it honest.

What's next: Chrome extension for LinkedIn feed summarization (BS Filter), using the same Gemini settings pattern.

If you're building in the career / HR tech space, I'd love to compare notes. OSS repo live now.

---

# 8. Interview Preparation

## 30 Likely Recruiter Questions

1. Tell me about this LinkedIn scraper project.
2. Why did you build it?
3. Is this live / deployed?
4. How many users does it have?
5. What stack did you use?
6. How long did it take to build?
7. Did you work alone or in a team?
8. What was the hardest bug you fixed?
9. What is Anything.com and how did you use it?
10. Is scraping LinkedIn legal?
11. How do you handle user privacy?
12. Where is user data stored?
13. What is BYOK and why did you choose it?
14. Do you use real AI or fake scores?
15. What model powers the matching feature?
16. Can I see a demo?
17. Is the code open source?
18. What's on your GitHub?
19. What role are you targeting with this project?
20. What did you learn from building this?
21. How does this relate to the job you're applying for?
22. What would you improve next?
23. Did you write tests?
24. How do you export data?
25. What formats do you support?
26. Who is the target user?
27. How is this different from Teal or Huntr?
28. Did you get user feedback?
29. What metrics prove it works?
30. Walk me through a user flow in 60 seconds.

## 30 Likely Technical Questions

1. Explain the system architecture end to end.
2. Why a bookmarklet instead of a Chrome extension?
3. How does the bookmarklet communicate with your backend?
4. How do you handle CORS from LinkedIn?
5. Why did LinkedIn break your UI and how did you fix it?
6. What is Shadow DOM and why use it here?
7. Explain your Neon Postgres schema.
8. How does upsert/deduplication work on job insert?
9. Walk through `extractKeywords` weighting logic.
10. How did you remove fake AI scores?
11. Explain the Gemini prompt and output schema.
12. Why call Gemini from the client instead of the server?
13. What are the security risks of client-side API keys?
14. How do you parse PDF resumes?
15. Explain Zustand store structure and actions.
16. How does pagination work in the Jobs table?
17. How do filters combine in JobsTab?
18. What happens when Gemini returns invalid JSON?
19. How do you rate-limit batch scoring?
20. Explain `dbToJob` and reasoning JSON parsing.
21. What's in your PATCH `/api/jobs/:id` handler?
22. Why UTF-8 BOM on CSV export?
23. How would you scale to 10k jobs?
24. What if LinkedIn changes selectors tomorrow?
25. How would you add embedding-based similarity?
26. Difference between tags and keywords in your model?
27. Explain the save-to-dashboard new tab problem.
28. How does `/dashboard/demo` seed data?
29. What would you add for multi-user support?
30. How would you deploy this without Anything.com?

## Ideal Answer Frameworks

**Architecture (60 sec):** Bookmarklet on LinkedIn extracts jobs → POST to React Router API → Neon Postgres. Dashboard reads via GET. Optional Gemini scoring runs browser-to-Google; results PATCH back. Sensitive credentials stay in localStorage.

**Why BYOK:** Avoids server-side resume storage, eliminates API cost to operator, increases trust. Tradeoff is UX friction.

**LinkedIn bug:** LinkedIn sanitizes innerHTML and strips ampersands, breaking HTML entities. Fixed by building UI with createElement and Shadow DOM isolation.

**Honest AI:** Removed server heuristic matchScore on ingest. UI gates display on verified Gemini JSON with `source: "gemini"`.

## Architecture Explanation (Interview Script)

*"The system has three tiers: injection layer, application layer, and data layer.*

*Injection layer is a bookmarklet — JavaScript running in LinkedIn's origin. It can't rely on our React bundle, so it's a self-contained IIFE injected via a javascript: URL. It uses Shadow DOM because LinkedIn's DOM policies break innerHTML-based widgets.*

*Application layer is a React Router 7 full-stack app. Zustand manages client state. API routes handle job CRUD against Neon serverless Postgres. On ingest we run deterministic analysis — keywords, experience level, role category — but not fake LLM scores.*

*Optional intelligence layer is Gemini 2.0 Flash called directly from the browser when the user provides their key and resume. We persist only the score and reasoning, not the resume.*

*Export layer generates CSV/JSON/XLSX for offline tracking."*

## Behavioral Questions

1. **Tell me about a time you shipped under ambiguity.** → Built on Anything.com; iterated from user feedback without full spec.
2. **Describe a difficult bug.** → LinkedIn innerHTML entity stripping; Shadow DOM fix.
3. **Tell me about prioritization.** → Full descriptions + keywords before Gemini; BS Filter deferred to Phase 2.
4. **How do you handle user trust?** → Removed fake scores; BYOK privacy model.
5. **Tell me about a failure.** → Save-to-dashboard same-tab navigation; multiple iterations on popup timing.
6. **How do you learn new tech fast?** → Gemini API, Neon, React Router 7 in same project.
7. **Describe working with constraints.** → No extension store; bookmarklet-only MVP.
8. **How do you document your work?** → GitHub README, guide page, this master document.

---

# 9. Portfolio Documentation

## GitHub README (Summary — see repo README.md)

**Title:** LinkedIn Job Information Scraper

**Description:** Scrape LinkedIn Jobs into your personal dashboard — full descriptions, top 10 ATS keywords, collections, and optional Gemini resume matching (BYOK).

**Quick start:**
```bash
cd apps/web
npm install
# Add DATABASE_URL to .env
npm run dev
```

**Setup:** Open `/` → drag bookmarklet → use on linkedin.com/jobs

**Demo:** `/dashboard/demo`

## Portfolio Description (100 words)

LinkedIn Job Information Scraper is a full-stack job search tool I designed and built to solve my own high-volume application workflow. A bookmarklet captures LinkedIn job listings with full descriptions and weighted ATS keywords into a Neon Postgres–backed React dashboard. Users organize scrape batches into custom collections, filter and analyze listings, and export to Excel. Optional Google Gemini 2.0 Flash scoring compares the user's resume to each job client-side — credentials never touch the server. I fixed production-breaking LinkedIn DOM issues using Shadow DOM and shipped honest AI UX by removing fake heuristic match scores.

## Feature List

- [x] Bookmarklet scraper (no extension store)
- [x] Shadow DOM panel (LinkedIn-compatible)
- [x] Full description expansion ("Show more")
- [x] User-defined collections
- [x] Server-side top-10 keyword extraction
- [x] Experience level & role category heuristics
- [x] Dashboard: Overview, Jobs, Analytics, Settings
- [x] Search + 5 filter dimensions
- [x] Job notes, expand rows, keyword pills
- [x] Export CSV / JSON / XLSX
- [x] Gemini BYOK resume scoring
- [x] Skill gap display
- [x] Batch "Score all unscored"
- [x] Demo page with sample jobs
- [x] Delete all jobs / per-job delete
- [ ] Save opens dashboard in new tab (reliable — in progress)
- [ ] Chrome extension packaging
- [ ] LinkedIn BS Filter (Phase 2)
- [ ] Multi-user auth
- [ ] Application status tracking

## Project Timeline (Reconstructed)

| Phase | Focus | Outcomes |
|-------|-------|----------|
| **v0** | Anything.com scaffold | Landing, basic bookmarklet, dashboard shell |
| **v1** | Core scraping | Job list, basic filters, export |
| **v2** | User feedback sprint | Full descriptions, keywords, collections, filter fixes, Excel export, no-refresh bookmarklet |
| **v2.1** | LinkedIn breakage | innerHTML → Shadow DOM fix |
| **v3** | Rebrand | LinkedIn Job Information Scraper |
| **v3.1** | Save UX | New tab attempts (v3/v4 bookmarklet iterations) |
| **v4** | Honest AI | BYOK Gemini scoring, remove fake match scores |
| **v5** (planned) | BS Filter extension | Feed post summarization |

## Screenshots Needed

1. **Home page** — bookmarklet drag setup, hero
2. **LinkedIn panel** — scraper UI on jobs search (show collection + description toggle)
3. **Dashboard Overview** — stats cards, workplace chart
4. **Jobs table** — keywords pills, match column, filters bar
5. **Expanded job row** — full description, Gemini reasoning, gaps
6. **Settings** — Gemini key + resume upload
7. **Export modal** — XLSX + keywords column highlighted
8. **Analytics** — score distribution chart
9. **Excel export sample** — top 10 keywords column visible
10. **Before/after** — broken garbled panel vs fixed Shadow DOM panel

## Demo Script (5 minutes)

1. **Intro (30s):** "This is LinkedIn Job Information Scraper — personal job CRM with honest AI."
2. **Setup (30s):** Show home page bookmarklet drag.
3. **Scrape (90s):** LinkedIn jobs search → click bookmark → enter "Demo Tech" collection → start scrape → show job count rising → save.
4. **Dashboard (60s):** Open `/dashboard` → filter by collection → expand row → show keywords + description.
5. **Gemini (60s):** Settings → paste resume snippet + API key → enable scoring → Score one job → show %, reasoning, gaps.
6. **Export (30s):** Export 5 jobs to XLSX → open file → highlight keywords column.
7. **Close (30s):** Mention BYOK privacy, GitHub link, Phase 2 BS Filter.

---

# 10. Missing Information Audit

## Assumptions Made

| Assumption | Basis |
|------------|-------|
| Single-tenant deployment (one user per instance) | No auth on job routes |
| Neon DB provisioned by Anything.com in production | User conversation + `.env` pattern |
| Primary UX is bookmarklet, not packaged extension | Working code path vs manifest reference |
| User applies to multiple role clusters | Stated in user prompts |
| GitHub repo matches local `apps/web` codebase | Remote URL confirmed |
| Gemini free tier ~15 RPM | Stated in BS Filter spec conversation |

## Uncertain Details

| Item | Status |
|------|--------|
| Exact `CREATE TABLE` migration file | Not in repo; schema inferred from INSERT |
| Production URL / custom domain | User mentioned Anything publish; exact URL unknown |
| Save-to-new-tab Panel v4 | Discussed and coded in session; **current committed `page.jsx` may still use redirect fallback** — verify before demo |
| `postMessage` import on dashboard | Implemented in session; **verify `dashboard/page.jsx` on main branch** |
| Real user metrics (jobs scraped, scores run) | Not instrumented |
| xlsx package in package.json | Used in ExportModal; confirm dependency on clone |
| LinkedIn ToS compliance stance | User responsibility; not legal-reviewed |

## Things Still Need to Build

### P0 (Reliability)
- [ ] Reliable Save → new tab (Panel v4+) without navigating LinkedIn
- [ ] Sync all conversation fixes to GitHub main consistently
- [ ] Update stale README (IndexedDB → Postgres, branding, Gemini docs)
- [ ] Update `manifest.json` and extension page branding to match rename

### P1 (Product)
- [ ] LinkedIn BS Filter Chrome extension (Phase 2)
- [ ] Application status field (Applied / Interview / Rejected)
- [ ] Cover letter / bullet tailoring from keywords + gaps
- [ ] Chrome Web Store extension (optional alternative to bookmarklet)

### P2 (Engineering)
- [ ] Automated tests (API routes, keyword extractor, gemini parse)
- [ ] Selector health check / user-report broken scrape
- [ ] Embedding-based similarity (optional second score)
- [ ] Multi-user auth + row-level security
- [ ] Rate limit dashboard for Gemini batch scoring progress

## Missing Metrics (for resume/portfolio)

| Metric | How to Capture |
|--------|----------------|
| Jobs scraped per session | Log in bookmarklet or DB count delta |
| Avg description length | SQL `AVG(LENGTH(description))` |
| Keyword non-empty rate | SQL count where `array_length(keywords,1) > 0` |
| Gemini scores performed | Count `ai_reasoning LIKE '%"source":"gemini"%'` |
| Export downloads | Frontend analytics event |
| Time saved vs manual | User study / timed comparison |
| Scrape success rate on LinkedIn | Session logs (0 jobs found vs N) |
| Panel install success | Cannot measure without analytics |

**Recommendation:** Run a personal benchmark: scrape 50 jobs with descriptions ON, export, score 10 with Gemini — record timings for portfolio metrics.

## Gaps Before Putting on Resume

1. **Confirm deployed demo URL** — recruiters will click
2. **Record 60–90 sec screen capture** following demo script
3. **Capture 3–5 screenshots** (see list above)
4. **Verify GitHub README matches implementation** (Postgres not IndexedDB)
5. **Fix or document Save-new-tab** — avoid demo embarrassment on LinkedIn live
6. **Add LICENSE file** (README says "[Your license]")
7. **Quantify one personal run** — e.g., "scraped 127 jobs in one session, 94% with full descriptions"
8. **Remove or update outdated marketing copy** on home hero ("AI scores" without qualification)
9. **Optional:** Write 2-min architecture blog post linking to repo
10. **Optional:** Add `RESTORE.md` for multi-machine copy-paste checklist ( discussed in support session)

---

## Appendix A: Conversation History Summary

Key decisions extracted from development sessions:

1. User identified fake AI scores → agreed on BYOK Gemini with honest UI
2. User requested full "Show more" descriptions → two-step card click + expand pipeline
3. User requested top-10 keywords in export → server weighted extractor
4. User requested collections → bookmarklet category field → `collection` column
5. User reported LinkedIn panel garbled (`#215;`) → Shadow DOM + createElement fix
6. User requested rebrand → LinkedIn Job Information Scraper
7. User requested Save without losing LinkedIn tab → multiple iterations (v3/v4); reliability TBD
8. User requested BS Filter → deferred Phase 2 after Gemini scoring
9. User struggled with local DATABASE_URL → documented Neon + `.env` setup
10. User copy-pasted between machines → dashboard breakage documented

## Appendix B: Key File Reference

| File | Lines (approx) | Role |
|------|----------------|------|
| `apps/web/src/app/page.jsx` | 684 | Home + bookmarklet |
| `apps/web/src/app/api/jobs/route.js` | 645 | Jobs API + keywords + analyze |
| `apps/web/src/app/dashboard/store.js` | 228 | Zustand state |
| `apps/web/src/app/dashboard/utils/gemini.js` | 98 | Gemini integration |
| `apps/web/src/app/dashboard/components/JobsTab.jsx` | 888 | Main jobs UI |
| `apps/web/src/app/dashboard/components/SettingsTab.jsx` | 263 | Settings + Gemini |

## Appendix C: Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes (for jobs) | Neon Postgres connection string |
| Gemini API key | No (user local) | Resume scoring only |

---

*Document generated from codebase analysis, GitHub repository state, and full project conversation history. For the latest code, see [main branch](https://github.com/siddharthurankar/linkedin-job-information-scraper/tree/main).*
