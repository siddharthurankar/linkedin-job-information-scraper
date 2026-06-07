# LinkedIn Job Information Scraper

Scrape LinkedIn Jobs into your personal dashboard — full descriptions, top 10 ATS keywords, collections, and optional Gemini resume matching (BYOK).

## Features
- Bookmarklet (no extension store required)
- Full job descriptions ("Show more" expansion)
- User-defined collections per scrape batch
- Server-side top-10 keyword extraction
- Dashboard: Overview, Jobs, Analytics, Settings
- Export: CSV, JSON, Excel (XLSX)
- Optional Gemini 2.0 Flash resume–job scoring (client-side)

## Stack
React 18 · React Router 7 · Zustand · Tailwind · Neon Postgres · Vite

## Quick start
cd apps/web
npm install
# Add DATABASE_URL to .env
npm run dev
# Open http://localhost:5173

## Setup bookmarklet
Open `/` → drag "Scrape LinkedIn Jobs" to bookmarks bar → use on linkedin.com/jobs

## Demo
/dashboard/demo — sample jobs without scraping

## Privacy
Gemini API key and resume text stay in browser localStorage. Scoring calls Google directly.

## License
[Your license]
