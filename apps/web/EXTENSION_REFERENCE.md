# Chrome Extension Reference Files

This document contains the reference code for the Chrome extension components. Copy these files to create a working Chrome extension that integrates with the dashboard.

## File: manifest.json

```json
{
  "manifest_version": 3,
  "name": "LinkedIn Job Information Scraper",
  "version": "1.0.0",
  "description": "Automatically scrape, organize, enrich, and export LinkedIn job postings",
  "permissions": [
    "storage",
    "tabs",
    "activeTab",
    "scripting"
  ],
  "host_permissions": [
    "https://*.linkedin.com/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["https://*.linkedin.com/*"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ],
  "action": {
    "default_popup": "popup.html",
    "default_title": "LinkedIn Job Information Scraper"
  },
  "web_accessible_resources": [
    {
      "resources": ["dashboard.html"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

## File: popup.html

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      width: 320px;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #ffffff;
    }
    h1 {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 4px;
    }
    .subtitle {
      font-size: 12px;
      color: #6B7280;
      margin-bottom: 16px;
    }
    .status {
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 16px;
    }
    .status-item {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #6B7280;
      margin-bottom: 4px;
    }
    .status-value {
      font-weight: 600;
      color: #111827;
    }
    button {
      width: 100%;
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      margin-bottom: 8px;
      transition: all 0.15s;
    }
    .btn-primary {
      background: #2563EB;
      color: white;
    }
    .btn-primary:hover {
      background: #1D4ED8;
    }
    .btn-secondary {
      background: #EFF6FF;
      color: #2563EB;
    }
    .btn-secondary:hover {
      background: #DBEAFE;
    }
    .btn-danger {
      background: #FEE2E2;
      color: #DC2626;
    }
    .btn-danger:hover {
      background: #FECACA;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .divider {
      height: 1px;
      background: #E5E7EB;
      margin: 16px 0;
    }
  </style>
</head>
<body>
  <h1>LinkedIn Job Intelligence</h1>
  <p class="subtitle">Smart job scraping & analysis</p>

  <div class="status">
    <div class="status-item">
      <span>Jobs collected:</span>
      <span class="status-value" id="jobCount">0</span>
    </div>
    <div class="status-item">
      <span>Pages scanned:</span>
      <span class="status-value" id="pageCount">0</span>
    </div>
    <div class="status-item">
      <span>Status:</span>
      <span class="status-value" id="status">Idle</span>
    </div>
  </div>

  <button id="startBtn" class="btn-primary">Start Scraping</button>
  <button id="pauseBtn" class="btn-secondary" disabled>Pause</button>
  <button id="stopBtn" class="btn-danger" disabled>Stop</button>

  <div class="divider"></div>

  <button id="dashboardBtn" class="btn-secondary">Open Dashboard</button>

  <script src="popup.js"></script>
</body>
</html>
```

## File: popup.js

```javascript
// Popup script for extension control

document.getElementById('startBtn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'START_SCRAPING', config: {} }, (response) => {
    if (response.success) {
      updateButtons(true);
    }
  });
});

document.getElementById('pauseBtn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'PAUSE_SCRAPING' });
});

document.getElementById('stopBtn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'STOP_SCRAPING' }, () => {
    updateButtons(false);
  });
});

document.getElementById('dashboardBtn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
});

function updateButtons(scraping) {
  document.getElementById('startBtn').disabled = scraping;
  document.getElementById('pauseBtn').disabled = !scraping;
  document.getElementById('stopBtn').disabled = !scraping;
}

function updateStatus(state) {
  document.getElementById('jobCount').textContent = state.jobsCollected || 0;
  document.getElementById('pageCount').textContent = state.pagesScanned || 0;
  document.getElementById('status').textContent = state.isActive ? 'Scraping...' : 'Idle';
}

// Poll for updates
setInterval(() => {
  chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
    if (response && response.state) {
      updateStatus(response.state);
      updateButtons(response.state.isActive);
    }
  });
}, 500);

// Initial state
chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
  if (response && response.state) {
    updateStatus(response.state);
  }
});
```

## File: background.js

```javascript
/* global chrome */
// Background Service Worker

let scrapingState = {
  isActive: false,
  jobsCollected: 0,
  pagesScanned: 0,
  startTime: null,
  isPaused: false
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'START_SCRAPING') {
    startScraping(request.config);
    sendResponse({ success: true });
  } else if (request.type === 'PAUSE_SCRAPING') {
    scrapingState.isPaused = true;
    sendResponse({ success: true });
  } else if (request.type === 'RESUME_SCRAPING') {
    scrapingState.isPaused = false;
    sendResponse({ success: true });
  } else if (request.type === 'STOP_SCRAPING') {
    stopScraping();
    sendResponse({ success: true });
  } else if (request.type === 'GET_STATE') {
    sendResponse({ state: scrapingState });
  } else if (request.type === 'JOB_SCRAPED') {
    scrapingState.jobsCollected++;
    chrome.runtime.sendMessage({ type: 'STATE_UPDATE', state: scrapingState });
    sendResponse({ success: true });
  } else if (request.type === 'PAGE_SCANNED') {
    scrapingState.pagesScanned++;
    chrome.runtime.sendMessage({ type: 'STATE_UPDATE', state: scrapingState });
    sendResponse({ success: true });
  } else if (request.type === 'OPEN_DASHBOARD') {
    // Replace with your deployed dashboard URL
    chrome.tabs.create({ url: 'https://your-dashboard-url.com/dashboard' });
    sendResponse({ success: true });
  }
  return true;
});

function startScraping(config) {
  scrapingState = {
    isActive: true,
    jobsCollected: 0,
    pagesScanned: 0,
    startTime: Date.now(),
    isPaused: false
  };

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'START_SCRAPING',
        config: config
      });
    }
  });
}

function stopScraping() {
  scrapingState.isActive = false;
  scrapingState.isPaused = false;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'STOP_SCRAPING' });
    }
  });
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('LinkedIn Job Information Scraper installed');
});
```

## File: content.js

```javascript
/* global chrome */
// Content script for LinkedIn scraping

let isScrapingActive = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'START_SCRAPING') {
    startScraping(request.config);
    sendResponse({ success: true });
  } else if (request.type === 'STOP_SCRAPING') {
    isScrapingActive = false;
    sendResponse({ success: true });
  }
  return true;
});

async function startScraping(config) {
  isScrapingActive = true;
  console.log('Starting LinkedIn job scraping...');

  // Detect page type
  const url = window.location.href;
  
  if (url.includes('/jobs/search') || url.includes('/jobs/collections')) {
    await scrapeJobListPage();
  } else if (url.includes('/jobs/view')) {
    await scrapeJobDetailPage();
  } else {
    console.log('Not a supported LinkedIn jobs page');
    return;
  }
}

async function scrapeJobListPage() {
  const jobCards = document.querySelectorAll('.job-card-container, .jobs-search-results__list-item');
  
  for (const card of jobCards) {
    if (!isScrapingActive) break;
    
    const job = extractJobFromCard(card);
    if (job) {
      await saveJob(job);
      chrome.runtime.sendMessage({ type: 'JOB_SCRAPED' });
    }
    
    await sleep(1000); // Rate limiting
  }
  
  chrome.runtime.sendMessage({ type: 'PAGE_SCANNED' });
}

async function scrapeJobDetailPage() {
  const job = {
    id: extractJobId(),
    title: document.querySelector('.jobs-unified-top-card__job-title')?.textContent?.trim(),
    company: document.querySelector('.jobs-unified-top-card__company-name')?.textContent?.trim(),
    location: document.querySelector('.jobs-unified-top-card__bullet')?.textContent?.trim(),
    description: document.querySelector('.jobs-description__content')?.textContent?.trim(),
    workplaceType: extractWorkplaceType(),
    metadata: {
      scrapedAt: Date.now(),
      sourcePage: window.location.href
    }
  };

  await saveJob(job);
  chrome.runtime.sendMessage({ type: 'JOB_SCRAPED' });
}

function extractJobFromCard(card) {
  // See utils/scraper.js in dashboard for full implementation
  return {
    id: card.dataset.jobId || generateId(),
    title: card.querySelector('.job-card-list__title')?.textContent?.trim(),
    company: card.querySelector('.job-card-container__company-name')?.textContent?.trim(),
    location: card.querySelector('.job-card-container__metadata-item')?.textContent?.trim(),
    workplaceType: extractWorkplaceType(),
    metadata: {
      scrapedAt: Date.now(),
      sourcePage: window.location.href
    }
  };
}

function extractJobId() {
  const match = window.location.href.match(/\/jobs\/view\/(\d+)/);
  return match ? match[1] : generateId();
}

function extractWorkplaceType() {
  const text = document.body.textContent.toLowerCase();
  if (text.includes('remote')) return 'Remote';
  if (text.includes('hybrid')) return 'Hybrid';
  return 'On-site';
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

async function saveJob(job) {
  // Save to IndexedDB (shared with dashboard)
  const request = indexedDB.open('LinkedInJobIntelligence', 1);
  
  request.onsuccess = (event) => {
    const db = event.target.result;
    const tx = db.transaction('jobs', 'readwrite');
    const store = tx.objectStore('jobs');
    store.put(job);
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

console.log('LinkedIn Job Intelligence content script loaded');
```

## Installation Steps

1. Create a folder: `linkedin-job-intelligence`
2. Copy all files above into the folder
3. Create placeholder icon files (icon16.png, icon48.png, icon128.png) or use any PNG icons
4. Open Chrome and go to `chrome://extensions/`
5. Enable "Developer mode" (top right)
6. Click "Load unpacked"
7. Select your extension folder
8. Extension is now installed!

## Integration with Dashboard

The extension shares IndexedDB with the dashboard:
- Database name: `LinkedInJobIntelligence`
- Object store: `jobs`
- Both extension and dashboard read/write to the same database

When you scrape jobs with the extension, they immediately appear in the dashboard at `/dashboard`.

## Dashboard URL Configuration

Update `background.js` line with your dashboard URL:

```javascript
chrome.tabs.create({ url: 'https://your-dashboard-url.com/dashboard' });
```

For local development:
```javascript
chrome.tabs.create({ url: 'http://localhost:5173/dashboard' });
```

## Notes

- The scraping logic in `content.js` is simplified for reference
- See `/apps/web/src/app/dashboard/utils/scraper.js` for full scraping implementation
- LinkedIn's DOM structure may change - adapt selectors as needed
- Respect LinkedIn's rate limits and terms of service
- Use responsibly for personal job searches only

---

For more details, see the main README and visit `/extension` in the dashboard.



