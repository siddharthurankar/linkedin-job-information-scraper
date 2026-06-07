# Smart LinkedIn Job Intelligence - Chrome Extension

## Overview

A production-ready Chrome extension that automatically scrapes, organizes, enriches, and exports LinkedIn job postings. This extension transforms your LinkedIn job search into a structured, AI-powered pipeline.

## Features

### 🎯 Smart Job Scraping
- Extract jobs from LinkedIn search results, saved jobs, and individual postings
- Support for infinite scroll pages
- Handle up to 3000 jobs per session
- Automatic duplicate detection
- Configurable scraping speed and delays

### 🧠 AI Enrichment
- Generate match scores (0-100) with detailed reasoning
- Automatic skill and technology extraction
- Experience level detection (Internship, Entry, Mid, Senior, Lead)
- Role categorization (Software, AI, Data, Product, etc.)
- Smart tagging system

### 📊 Analytics Dashboard
- Overview page with key metrics
- Jobs table with advanced filtering and sorting
- Analytics visualizations (charts and graphs)
- Export to CSV, JSON, or Excel
- Settings management

### 🔒 Privacy First
- All data stored locally in IndexedDB
- No external servers or tracking
- No data sent to third parties
- Complete data ownership

## Architecture

### Components

1. **Dashboard (React + TypeScript + Zustand)**
   - Job management interface
   - Analytics and visualizations
   - Export functionality
   - Settings configuration

2. **Chrome Extension (Manifest V3)**
   - Background service workers
   - Content scripts for LinkedIn scraping
   - Popup UI for scraping control

3. **Storage (IndexedDB)**
   - Local-first data persistence
   - Fast queries with indexed fields
   - Handles thousands of jobs efficiently

4. **AI Integration**
   - Pluggable AI provider system
   - Support for OpenAI, Anthropic, Google Gemini
   - Mock AI for demo purposes

## Dashboard Pages

### `/dashboard` - Main Dashboard
- Overview tab with statistics
- Jobs table with filtering
- Analytics charts
- Settings panel

### `/dashboard/demo` - Demo Scraping
- Simulates scraping 8 sample jobs
- Shows AI enrichment in action
- Perfect for testing without LinkedIn access

### `/extension` - Setup Guide
- Installation instructions
- Extension file reference
- Architecture documentation

## Usage

### Quick Start (Demo Mode)

1. Visit `/dashboard/demo`
2. Click "Start Demo Scraping"
3. Watch as sample jobs are scraped and enriched
4. Explore the dashboard features

### Production Use (With Extension)

1. Create a folder for the extension
2. Copy extension files (manifest.json, background.js, content.js, popup files)
3. Load unpacked extension in Chrome
4. Visit LinkedIn and start scraping
5. View and manage jobs in the dashboard

## Data Flow

```
LinkedIn Page → Content Script → Background Worker → IndexedDB
                                                          ↓
                                                     Dashboard
                                                          ↓
                                                    Export (CSV/JSON/Excel)
```

## Key Features

### Job Extraction
- Title, Company, Location
- Workplace type (Remote/Hybrid/On-site)
- Employment type
- Date posted
- Applicant count
- Easy Apply status
- Full job description
- Required/preferred qualifications
- Salary information
- Skills and technologies

### AI Analysis
- Match score with reasoning
- Missing skills identification
- Required technologies list
- Difficulty estimate
- Experience level classification
- Role category
- Smart tags

### Filtering & Search
- Filter by title, company, location
- Remote status filter
- Date range filtering
- Experience level
- Match score range
- Easy Apply status
- Keyword search
- Multi-select filters

### Export Options
- CSV format
- JSON format
- Excel (XLSX) format
- Include/exclude descriptions
- Include/exclude AI analysis
- Include/exclude tags
- Include/exclude metadata
- Export selected or all jobs

## Technical Stack

### Frontend
- React (functional components with hooks)
- Zustand (state management)
- IndexedDB (local storage)
- Recharts (analytics visualizations)
- Lucide React (icons)
- TailwindCSS (styling)

### Extension
- Manifest V3
- Chrome APIs (storage, tabs, scripting)
- Content scripts for DOM scraping
- Background service workers

### Data Processing
- SheetJS (XLSX export)
- Custom CSV/JSON exporters
- AI integration layer (pluggable)

## Settings

### Scraping Settings
- Max jobs per session (default: 3000)
- Delay between requests (default: 1000ms)
- Auto-scroll speed (default: 500ms)
- Duplicate handling (skip/overwrite/keep)

### AI Settings
- Enable/disable AI analysis
- AI provider selection (OpenAI/Anthropic/Google)
- Bring your own API keys

### Export Settings
- Preferred export format (CSV/JSON/XLSX)

### Appearance
- Theme selection (Light/Dark/System)

## Privacy & Security

- **No external servers**: All processing happens locally
- **No tracking**: No analytics or user tracking
- **No data sharing**: Your job data never leaves your browser
- **API keys**: Stored locally, never transmitted except to chosen AI provider
- **IndexedDB only**: All data in browser-local storage

## Performance

- Handles 3000+ jobs smoothly
- Lazy loading for large datasets
- Efficient IndexedDB queries with indexes
- Batch processing for AI enrichment
- Memory-optimized rendering

## Browser Compatibility

- Chrome (Manifest V3)
- Edge (Chromium-based)
- Brave (Chromium-based)
- Opera (Chromium-based)

## Future Enhancements

- Collections and saved searches
- Job notes and custom labels
- Application tracking
- Email notifications
- Advanced AI insights
- Job comparison tool
- Interview prep integration

## Development

### Prerequisites
- Node.js 16+
- Chrome browser
- Basic knowledge of React and Chrome extensions

### Local Development
1. Clone the repository
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`
4. Build extension files separately
5. Load unpacked extension in Chrome

### Project Structure
```
/apps/web/src/
├── app/
│   ├── dashboard/
│   │   ├── page.jsx              # Main dashboard
│   │   ├── demo/page.jsx         # Demo scraping
│   │   ├── store.js              # Zustand store
│   │   ├── components/           # Dashboard components
│   │   └── utils/                # Utilities (db, ai, export, scraper)
│   ├── extension/page.jsx        # Extension setup guide
│   └── page.jsx                  # Landing page
```

## License

This is a demo project for personal use. Adapt and modify as needed for your own job search automation.

## Disclaimer

This tool is for personal use only. Respect LinkedIn's Terms of Service and use responsibly. The scraping functionality should only be used on your own job searches and saved jobs, not for bulk data collection or commercial purposes.

## Support

For issues or questions:
1. Check the `/extension` setup guide
2. Try the `/dashboard/demo` to test functionality
3. Review this README for architecture details

---

Built with ❤️ for smarter job searching
