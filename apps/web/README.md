# Smart LinkedIn Job Intelligence

A production-ready web application and Chrome extension for automatically scraping, organizing, enriching, and exporting LinkedIn job postings.

## Quick Start

### Try the Demo
Visit `/dashboard/demo` to see the platform in action with sample data.

### Use the Dashboard
Visit `/dashboard` to manage jobs, view analytics, and export data.

### Read the Guide
Visit `/guide` for comprehensive documentation.

### Set Up Extension
Visit `/extension` for Chrome extension installation instructions.

## Features

- **Smart Scraping**: Extract jobs from LinkedIn with up to 3000 jobs per session
- **AI Enrichment**: Automatic job analysis with match scores, skill extraction, and categorization
- **Advanced Filtering**: Search and filter by title, company, location, remote status, and more
- **Export Options**: Export to CSV, JSON, or Excel with customizable fields
- **Analytics Dashboard**: Visualize trends, companies, skills, and locations
- **Privacy First**: All data stored locally in IndexedDB, no external servers

## Tech Stack

- **Frontend**: React (Vite), Zustand, TailwindCSS
- **Data Viz**: Recharts
- **Storage**: IndexedDB
- **Export**: SheetJS (XLSX), custom CSV/JSON exporters
- **Extension**: Chrome Manifest V3

## Project Structure

```
/apps/web/src/
├── app/
│   ├── page.jsx                  # Landing page
│   ├── guide/page.jsx            # User guide
│   ├── extension/page.jsx        # Extension setup
│   └── dashboard/
│       ├── page.jsx              # Main dashboard
│       ├── demo/page.jsx         # Demo scraping
│       ├── store.js              # Zustand store
│       ├── components/           # Dashboard components
│       │   ├── OverviewTab.jsx
│       │   ├── JobsTab.jsx
│       │   ├── AnalyticsTab.jsx
│       │   ├── SettingsTab.jsx
│       │   └── ExportModal.jsx
│       └── utils/                # Utilities
│           ├── db.js             # IndexedDB operations
│           ├── ai.js             # AI enrichment
│           ├── export.js         # Export functions
│           └── scraper.js        # LinkedIn scraping logic
```

## Pages

- **`/`** - Landing page with feature overview
- **`/dashboard`** - Main dashboard (Overview, Jobs, Analytics, Settings)
- **`/dashboard/demo`** - Demo scraping with sample data
- **`/guide`** - Comprehensive user guide
- **`/extension`** - Chrome extension setup instructions

## Key Components

### Dashboard Tabs

1. **Overview**: Key metrics, workplace distribution, top skills, recent jobs
2. **Jobs**: Searchable table with filtering, sorting, bulk actions, export
3. **Analytics**: Charts for companies, skills, locations, match scores, trends
4. **Settings**: Scraping config, AI settings, export preferences, data management

### Data Model

Each job includes:
- Basic info (title, company, location, URL)
- Workplace type, employment type, date posted
- Full description and qualifications
- AI analysis (match score, experience level, role category, tags)
- Metadata (scraped timestamp, source page, search query)

### Storage

Uses IndexedDB with indexes on:
- Company, title, location
- Date posted, match score, scraped timestamp

Handles 3000+ jobs efficiently with lazy loading and optimized queries.

### AI Enrichment

Mock AI implementation included for demo. Replace `analyzeJobWithAI()` in `utils/ai.js` with your own AI provider:

```javascript
// Example: OpenAI integration
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  })
});
```

## Export

Supports three formats:
- **CSV**: Universal, opens in all spreadsheet tools
- **JSON**: Developer-friendly, programmatic access
- **XLSX**: Native Excel format

Customizable options:
- Include/exclude descriptions
- Include/exclude AI analysis
- Include/exclude tags
- Include/exclude metadata

## Privacy & Security

- **100% local processing**: No external servers
- **No tracking**: No analytics or telemetry
- **Your API keys**: Stored locally, only sent to your chosen AI provider
- **Complete control**: Clear data anytime from Settings

## Performance

- Handles 3000+ jobs smoothly
- Lazy loading for large datasets
- Efficient IndexedDB queries with indexes
- Batch processing for AI enrichment
- Memory-optimized rendering

## Browser Support

- Chrome (recommended)
- Edge (Chromium)
- Brave
- Opera

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## Chrome Extension

See `/extension` page and `README_EXTENSION.md` for complete extension setup instructions.

The extension uses:
- Manifest V3
- Content scripts for LinkedIn scraping
- Background service workers
- Shared IndexedDB with dashboard

## License

Demo project for personal use. Adapt as needed.

## Disclaimer

For personal use only. Respect LinkedIn's Terms of Service. Use responsibly for your own job searches, not for bulk data collection or commercial purposes.

---

Built for smarter job searching 🚀
