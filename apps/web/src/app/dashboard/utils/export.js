import * as XLSX from "xlsx";

export async function exportToCSV(jobs, options = {}) {
  const {
    includeDescriptions = true,
    includeAI = true,
    includeTags = true,
    includeMetadata = true,
  } = options;

  const headers = [
    "Job ID",
    "Title",
    "Company",
    "Location",
    "Workplace Type",
    "Employment Type",
    "Date Posted",
    "Job URL",
    "Easy Apply",
  ];

  if (includeDescriptions) {
    headers.push("Description");
  }

  if (includeAI) {
    headers.push(
      "Match Score",
      "Experience Level",
      "Role Category",
      "Difficulty",
    );
  }

  if (includeTags) {
    headers.push("Tags");
  }

  if (includeMetadata) {
    headers.push("Scraped At", "Source Page");
  }

  const rows = jobs.map((job) => {
    const row = [
      job.id,
      job.title,
      job.company,
      job.location,
      job.workplaceType,
      job.employmentType,
      job.datePosted ? new Date(job.datePosted).toLocaleDateString() : "",
      job.jobUrl,
      job.easyApply ? "Yes" : "No",
    ];

    if (includeDescriptions) {
      row.push(job.description?.replace(/\n/g, " ") || "");
    }

    if (includeAI) {
      row.push(
        job.aiAnalysis?.matchScore || "",
        job.aiAnalysis?.experienceLevel || "",
        job.aiAnalysis?.roleCategory || "",
        job.aiAnalysis?.difficultyEstimate || "",
      );
    }

    if (includeTags) {
      row.push(job.aiAnalysis?.tags?.join(", ") || "");
    }

    if (includeMetadata) {
      row.push(
        job.metadata?.scrapedAt
          ? new Date(job.metadata.scrapedAt).toLocaleString()
          : "",
        job.metadata?.sourcePage || "",
      );
    }

    return row;
  });

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");

  return csv;
}

export async function exportToJSON(jobs, options = {}) {
  const {
    includeDescriptions = true,
    includeAI = true,
    includeTags = true,
    includeMetadata = true,
  } = options;

  const filtered = jobs.map((job) => {
    const exported = {
      id: job.id,
      title: job.title,
      company: job.company,
      companyUrl: job.companyUrl,
      jobUrl: job.jobUrl,
      location: job.location,
      workplaceType: job.workplaceType,
      employmentType: job.employmentType,
      datePosted: job.datePosted,
      applicantCount: job.applicantCount,
      easyApply: job.easyApply,
    };

    if (includeDescriptions) {
      exported.description = job.description;
      exported.responsibilities = job.responsibilities;
      exported.requiredQualifications = job.requiredQualifications;
      exported.preferredQualifications = job.preferredQualifications;
    }

    if (includeAI && job.aiAnalysis) {
      exported.aiAnalysis = job.aiAnalysis;
    }

    if (includeTags && job.aiAnalysis?.tags) {
      exported.tags = job.aiAnalysis.tags;
    }

    if (includeMetadata && job.metadata) {
      exported.metadata = job.metadata;
    }

    return exported;
  });

  return JSON.stringify(filtered, null, 2);
}

export async function exportToExcel(jobs, options = {}) {
  const {
    includeDescriptions = true,
    includeAI = true,
    includeTags = true,
    includeMetadata = true,
  } = options;

  const data = jobs.map((job) => {
    const row = {
      "Job ID": job.id,
      Title: job.title,
      Company: job.company,
      Location: job.location,
      "Workplace Type": job.workplaceType,
      "Employment Type": job.employmentType,
      "Date Posted": job.datePosted
        ? new Date(job.datePosted).toLocaleDateString()
        : "",
      "Job URL": job.jobUrl,
      "Easy Apply": job.easyApply ? "Yes" : "No",
    };

    if (includeDescriptions) {
      row["Description"] = job.description || "";
    }

    if (includeAI) {
      row["Match Score"] = job.aiAnalysis?.matchScore || "";
      row["Experience Level"] = job.aiAnalysis?.experienceLevel || "";
      row["Role Category"] = job.aiAnalysis?.roleCategory || "";
      row["Difficulty"] = job.aiAnalysis?.difficultyEstimate || "";
    }

    if (includeTags) {
      row["Tags"] = job.aiAnalysis?.tags?.join(", ") || "";
    }

    if (includeMetadata) {
      row["Scraped At"] = job.metadata?.scrapedAt
        ? new Date(job.metadata.scrapedAt).toLocaleString()
        : "";
      row["Source Page"] = job.metadata?.sourcePage || "";
    }

    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs");

  return XLSX.write(workbook, { type: "array", bookType: "xlsx" });
}

export function downloadFile(content, filename, type = "text/csv") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
