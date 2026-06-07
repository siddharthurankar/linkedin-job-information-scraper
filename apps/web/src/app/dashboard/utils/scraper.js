// LinkedIn job scraping utilities

export function extractJobFromCard(element) {
  try {
    const job = {
      id: generateJobId(element),
      title: extractText(element, ".job-card-list__title, .job-title"),
      company: extractText(
        element,
        ".job-card-container__company-name, .company-name",
      ),
      companyUrl: extractHref(element, ".job-card-container__company-name"),
      jobUrl: extractJobUrl(element),
      location: extractText(
        element,
        ".job-card-container__metadata-item, .job-location",
      ),
      workplaceType: extractWorkplaceType(element),
      employmentType: extractEmploymentType(element),
      datePosted: extractDatePosted(element),
      applicantCount: extractApplicantCount(element),
      easyApply: checkEasyApply(element),
      companyLogoUrl: extractImageSrc(
        element,
        ".job-card-container__logo, .company-logo",
      ),
      metadata: {
        scrapedAt: Date.now(),
        sourcePage: window.location.href,
        searchQuery: extractSearchQuery(),
      },
    };

    return job;
  } catch (error) {
    console.error("Failed to extract job from card:", error);
    return null;
  }
}

export function extractJobDetails(document) {
  try {
    const details = {
      description: extractText(
        document,
        ".jobs-description__content, .job-description",
      ),
      responsibilities: extractList(document, ".responsibilities"),
      requiredQualifications: extractList(document, ".required-qualifications"),
      preferredQualifications: extractList(
        document,
        ".preferred-qualifications",
      ),
      skills: extractSkills(document),
      technologies: extractTechnologies(document),
      salary: extractSalary(document),
      experienceRequirements: extractExperience(document),
      educationRequirements: extractEducation(document),
      visaSponsorship: checkVisaSponsorship(document),
    };

    return details;
  } catch (error) {
    console.error("Failed to extract job details:", error);
    return {};
  }
}

// Helper functions

function extractText(element, selector) {
  const el =
    typeof element === "string"
      ? document.querySelector(selector)
      : element.querySelector(selector);
  return el?.textContent?.trim() || "";
}

function extractHref(element, selector) {
  const el = element.querySelector(selector);
  return el?.href || "";
}

function extractJobUrl(element) {
  const link = element.querySelector('a[href*="/jobs/"]');
  return link?.href || "";
}

function extractImageSrc(element, selector) {
  const img = element.querySelector(selector);
  return img?.src || "";
}

function extractWorkplaceType(element) {
  const text = element.textContent.toLowerCase();
  if (text.includes("remote")) return "Remote";
  if (text.includes("hybrid")) return "Hybrid";
  return "On-site";
}

function extractEmploymentType(element) {
  const text = element.textContent.toLowerCase();
  if (text.includes("full-time")) return "Full-time";
  if (text.includes("part-time")) return "Part-time";
  if (text.includes("contract")) return "Contract";
  if (text.includes("internship")) return "Internship";
  return "Unknown";
}

function extractDatePosted(element) {
  const timeEl = element.querySelector("time");
  if (timeEl?.dateTime) {
    return new Date(timeEl.dateTime).getTime();
  }

  const text = element.textContent;
  const match = text.match(/(\d+)\s+(minute|hour|day|week|month)s?\s+ago/i);
  if (match) {
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    const now = Date.now();

    if (unit === "minute") return now - value * 60 * 1000;
    if (unit === "hour") return now - value * 60 * 60 * 1000;
    if (unit === "day") return now - value * 24 * 60 * 60 * 1000;
    if (unit === "week") return now - value * 7 * 24 * 60 * 60 * 1000;
    if (unit === "month") return now - value * 30 * 24 * 60 * 60 * 1000;
  }

  return Date.now();
}

function extractApplicantCount(element) {
  const text = element.textContent;
  const match = text.match(/(\d+)\s+applicants?/i);
  return match ? parseInt(match[1]) : null;
}

function checkEasyApply(element) {
  return element.textContent.toLowerCase().includes("easy apply");
}

function extractSearchQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("keywords") || params.get("q") || "";
}

function extractList(document, selector) {
  const container = document.querySelector(selector);
  if (!container) return [];

  const items = container.querySelectorAll("li");
  return Array.from(items).map((item) => item.textContent.trim());
}

function extractSkills(document) {
  const skills = [];
  const text = document.body.textContent;

  // Common tech skills to detect
  const commonSkills = [
    "JavaScript",
    "Python",
    "Java",
    "React",
    "Node.js",
    "TypeScript",
    "SQL",
    "AWS",
    "Docker",
    "Kubernetes",
    "Git",
    "GraphQL",
    "MongoDB",
    "PostgreSQL",
    "REST API",
    "Machine Learning",
    "TensorFlow",
    "PyTorch",
    "Agile",
    "Scrum",
  ];

  commonSkills.forEach((skill) => {
    if (text.includes(skill)) {
      skills.push(skill);
    }
  });

  return skills;
}

function extractTechnologies(document) {
  return extractSkills(document);
}

function extractSalary(document) {
  const text = document.body.textContent;
  const match = text.match(/\$[\d,]+\s*-\s*\$[\d,]+/);
  return match ? match[0] : null;
}

function extractExperience(document) {
  const text = document.body.textContent;
  const match = text.match(/(\d+)\+?\s*years?\s+(?:of\s+)?experience/i);
  return match ? match[0] : null;
}

function extractEducation(document) {
  const text = document.body.textContent.toLowerCase();
  if (
    text.includes("bachelor's") ||
    text.includes("bs ") ||
    text.includes("ba ")
  ) {
    return "Bachelor's Degree";
  }
  if (
    text.includes("master's") ||
    text.includes("ms ") ||
    text.includes("ma ")
  ) {
    return "Master's Degree";
  }
  if (text.includes("phd") || text.includes("doctorate")) {
    return "PhD";
  }
  return null;
}

function checkVisaSponsorship(document) {
  const text = document.body.textContent.toLowerCase();
  return text.includes("visa sponsor") || text.includes("work authorization");
}

function generateJobId(element) {
  const url = extractJobUrl(element);
  const match = url.match(/\/jobs\/view\/(\d+)/);
  if (match) return match[1];

  // Fallback: generate hash from title + company
  const title = extractText(element, ".job-card-list__title, .job-title");
  const company = extractText(
    element,
    ".job-card-container__company-name, .company-name",
  );
  return btoa(`${title}-${company}`).substring(0, 16);
}

export function createDuplicateHash(job) {
  return btoa(`${job.title}-${job.company}-${job.location}`);
}
