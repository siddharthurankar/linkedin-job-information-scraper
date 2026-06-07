// IndexedDB utilities for local job storage

let dbPromise = null;

export async function openDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open("LinkedInJobIntelligence", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create jobs object store
      if (!db.objectStoreNames.contains("jobs")) {
        const jobStore = db.createObjectStore("jobs", { keyPath: "id" });

        // Create indexes for efficient querying
        jobStore.createIndex("company", "company", { unique: false });
        jobStore.createIndex("title", "title", { unique: false });
        jobStore.createIndex("location", "location", { unique: false });
        jobStore.createIndex("datePosted", "datePosted", { unique: false });
        jobStore.createIndex("matchScore", "aiAnalysis.matchScore", {
          unique: false,
        });
        jobStore.createIndex("scrapedAt", "metadata.scrapedAt", {
          unique: false,
        });
      }

      // Create collections object store
      if (!db.objectStoreNames.contains("collections")) {
        db.createObjectStore("collections", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };
  });

  return dbPromise;
}

export async function getAllJobs() {
  const db = await openDB();
  const tx = db.transaction("jobs", "readonly");
  const store = tx.objectStore("jobs");
  return store.getAll();
}

export async function getJob(id) {
  const db = await openDB();
  const tx = db.transaction("jobs", "readonly");
  const store = tx.objectStore("jobs");
  return store.get(id);
}

export async function addJob(job) {
  const db = await openDB();
  const tx = db.transaction("jobs", "readwrite");
  const store = tx.objectStore("jobs");
  await store.put(job);
  return tx.complete;
}

export async function deleteJob(id) {
  const db = await openDB();
  const tx = db.transaction("jobs", "readwrite");
  const store = tx.objectStore("jobs");
  await store.delete(id);
  return tx.complete;
}

export async function clearAllJobs() {
  const db = await openDB();
  const tx = db.transaction("jobs", "readwrite");
  const store = tx.objectStore("jobs");
  await store.clear();
  return tx.complete;
}

export async function searchJobs(filters = {}) {
  const db = await openDB();
  const tx = db.transaction("jobs", "readonly");
  const store = tx.objectStore("jobs");
  const allJobs = await store.getAll();

  return allJobs.filter((job) => {
    // Filter by title
    if (
      filters.title &&
      !job.title?.toLowerCase().includes(filters.title.toLowerCase())
    ) {
      return false;
    }

    // Filter by company
    if (
      filters.company &&
      !job.company?.toLowerCase().includes(filters.company.toLowerCase())
    ) {
      return false;
    }

    // Filter by location
    if (
      filters.location &&
      !job.location?.toLowerCase().includes(filters.location.toLowerCase())
    ) {
      return false;
    }

    // Filter by remote status
    if (filters.workplaceType && job.workplaceType !== filters.workplaceType) {
      return false;
    }

    // Filter by match score
    if (
      filters.minMatchScore &&
      (job.aiAnalysis?.matchScore || 0) < filters.minMatchScore
    ) {
      return false;
    }

    // Filter by experience level
    if (
      filters.experienceLevel &&
      job.aiAnalysis?.experienceLevel !== filters.experienceLevel
    ) {
      return false;
    }

    // Filter by easy apply
    if (
      filters.easyApply !== undefined &&
      job.easyApply !== filters.easyApply
    ) {
      return false;
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      const jobTags = job.aiAnalysis?.tags || [];
      if (!filters.tags.some((tag) => jobTags.includes(tag))) {
        return false;
      }
    }

    return true;
  });
}
