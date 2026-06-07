import sql from "@/app/api/utils/sql";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "3000");
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search") || "";
    const workplace = searchParams.get("workplace") || "";
    const collection = searchParams.get("collection") || "";

    let query = "SELECT * FROM linkedin_jobs WHERE 1=1";
    const values = [];
    let i = 1;

    if (search) {
      query += ` AND (LOWER(title) LIKE LOWER($${i}) OR LOWER(company) LIKE LOWER($${i}) OR LOWER(location) LIKE LOWER($${i}))`;
      values.push("%" + search + "%");
      i++;
    }

    if (workplace && workplace !== "all") {
      query += ` AND workplace_type = $${i}`;
      values.push(workplace);
      i++;
    }

    if (collection && collection !== "all") {
      query += ` AND collection = $${i}`;
      values.push(collection);
      i++;
    }

    query += ` ORDER BY scraped_at DESC LIMIT $${i} OFFSET $${i + 1}`;
    values.push(limit, offset);

    const jobs = await sql(query, values);
    const countResult = await sql("SELECT COUNT(*) FROM linkedin_jobs");
    const total = parseInt(countResult[0].count);

    return Response.json({ jobs: jobs.map(dbToJob), total }, { headers: CORS });
  } catch (error) {
    console.error("GET /api/jobs error:", error);
    return Response.json(
      { error: error.message },
      { status: 500, headers: CORS },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const jobsToAdd = body.jobs || (body.id ? [body] : []);

    if (!jobsToAdd.length) {
      return Response.json(
        { error: "No jobs provided" },
        { status: 400, headers: CORS },
      );
    }

    let added = 0;
    let skipped = 0;

    for (const job of jobsToAdd) {
      if (!job.id) continue;

      const analysis = analyzeJob(job);
      const keywords = extractKeywords(job.title, job.description);
      // user-set category from the bookmarklet goes into `collection`
      const collection = job.category || job.collection || "General";

      try {
        await sql`
          INSERT INTO linkedin_jobs (
            id, title, company, company_url, job_url, location,
            workplace_type, employment_type, date_posted, applicant_count,
            easy_apply, description, salary, skills, match_score,
            experience_level, role_category, difficulty, tags, ai_reasoning,
            source_page, scraped_at, collection, keywords
          ) VALUES (
            ${job.id},
            ${job.title || null},
            ${job.company || null},
            ${job.companyUrl || job.company_url || null},
            ${job.jobUrl || job.job_url || null},
            ${job.location || null},
            ${job.workplaceType || job.workplace_type || "Unknown"},
            ${job.employmentType || job.employment_type || null},
            ${job.datePosted || job.date_posted || null},
            ${job.applicantCount || job.applicant_count || null},
            ${!!(job.easyApply || job.easy_apply)},
            ${job.description || null},
            ${job.salary || null},
            ${analysis.skills},
            ${null},
            ${analysis.experienceLevel},
            ${analysis.roleCategory},
            ${analysis.difficulty},
            ${analysis.tags},
            ${null},
            ${job.metadata?.sourcePage || job.source_page || null},
            ${job.metadata?.scrapedAt || job.scraped_at || Date.now()},
            ${collection},
            ${keywords}
          )
          ON CONFLICT (id) DO UPDATE SET
            description = COALESCE(NULLIF(EXCLUDED.description, ''), linkedin_jobs.description),
            keywords = CASE WHEN array_length(EXCLUDED.keywords, 1) > 0 THEN EXCLUDED.keywords ELSE linkedin_jobs.keywords END,
            scraped_at = GREATEST(linkedin_jobs.scraped_at, EXCLUDED.scraped_at)
        `;
        added++;
      } catch (err) {
        console.error("Insert error for job", job.id, err.message);
        skipped++;
      }
    }

    return Response.json(
      { success: true, count: added, skipped },
      { headers: CORS },
    );
  } catch (error) {
    console.error("POST /api/jobs error:", error);
    return Response.json(
      { error: error.message },
      { status: 500, headers: CORS },
    );
  }
}

export async function DELETE() {
  try {
    await sql`DELETE FROM linkedin_jobs`;
    return Response.json({ success: true }, { headers: CORS });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500, headers: CORS },
    );
  }
}

// ─── DB → Frontend mapper ───────────────────────────────────────────────────

function parseAiReasoning(raw) {
  if (!raw || typeof raw !== "string") return { reasoning: raw, gemini: null };
  try {
    const data = JSON.parse(raw);
    if (data?.source === "gemini") {
      return {
        reasoning: data.reasoning || "",
        gemini: data,
      };
    }
  } catch {
    /* plain text */
  }
  return { reasoning: raw, gemini: null };
}

function dbToJob(row) {
  const { reasoning, gemini } = parseAiReasoning(row.ai_reasoning);
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    companyUrl: row.company_url,
    jobUrl: row.job_url,
    location: row.location,
    workplaceType: row.workplace_type,
    employmentType: row.employment_type,
    datePosted: row.date_posted,
    applicantCount: row.applicant_count,
    easyApply: row.easy_apply,
    description: row.description,
    salary: row.salary,
    skills: row.skills || [],
    keywords: row.keywords || [],
    notes: row.notes,
    collection: row.collection,
    isSaved: row.is_saved,
    aiAnalysis: {
      matchScore: gemini ? row.match_score : null,
      experienceLevel: row.experience_level,
      roleCategory: row.role_category,
      difficulty: row.difficulty,
      tags: row.tags || [],
      reasoning,
      missingGaps: gemini?.missingGaps || [],
      scoredWithGemini: !!gemini,
      scoredAt: gemini?.scoredAt || null,
    },
    metadata: {
      sourcePage: row.source_page,
      scrapedAt: row.scraped_at ? Number(row.scraped_at) : null,
    },
  };
}

// ─── Keyword extractor ───────────────────────────────────────────────────────

function extractKeywords(title, description) {
  if (!description && !title) return [];

  const text = ((title || "") + " " + (description || "")).toLowerCase();

  const STOP = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "as",
    "is",
    "was",
    "are",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "can",
    "use",
    "using",
    "work",
    "working",
    "develop",
    "build",
    "create",
    "manage",
    "provide",
    "ensure",
    "support",
    "implement",
    "experience",
    "strong",
    "good",
    "excellent",
    "ability",
    "skills",
    "knowledge",
    "understanding",
    "familiar",
    "proficiency",
    "expertise",
    "highly",
    "preferred",
    "required",
    "must",
    "plus",
    "etc",
    "including",
    "such",
    "other",
    "also",
    "however",
    "within",
    "across",
    "between",
    "through",
    "about",
    "than",
    "into",
    "during",
    "before",
    "after",
    "up",
    "out",
    "own",
    "our",
    "your",
    "their",
    "its",
    "all",
    "some",
    "any",
    "same",
    "both",
    "each",
    "every",
    "few",
    "many",
    "much",
    "more",
    "most",
    "new",
    "high",
    "large",
    "great",
    "well",
    "just",
    "very",
    "too",
    "only",
    "here",
    "there",
    "then",
    "so",
    "if",
    "while",
    "since",
    "unless",
    "until",
    "we",
    "you",
    "they",
    "them",
    "us",
    "this",
    "that",
    "these",
    "those",
    "who",
    "what",
    "when",
    "where",
    "how",
    "team",
    "role",
    "position",
    "job",
    "company",
    "candidate",
    "applicant",
    "looking",
    "seeking",
    "join",
    "help",
    "get",
    "make",
    "take",
    "need",
    "want",
    "able",
    "responsible",
    "opportunity",
    "business",
    "product",
    "service",
    "project",
    "process",
    "solution",
    "system",
    "environment",
    "level",
    "years",
    "year",
    "least",
    "deliver",
    "drive",
    "lead",
    "define",
    "design",
    "partner",
    "collaborate",
    "communicate",
    "present",
    "minimum",
    "one",
    "two",
    "three",
    "five",
    "seven",
    "ten",
  ]);

  const counts = {};

  // Count all meaningful words
  const wordRe = /\b([a-z][a-z+#.\-\/]{2,})\b/g;
  let m;
  while ((m = wordRe.exec(text)) !== null) {
    const w = m[1];
    if (!STOP.has(w) && w.length > 2) {
      counts[w] = (counts[w] || 0) + 1;
    }
  }

  // Triple-weight words that appear near "required/must/minimum/mandatory/essential"
  const reqRe =
    /(?:required?|must.have|minimum|mandatory|essential|critical)\W{0,40}([a-z][a-z+#.\-\/]{2,})/g;
  while ((m = reqRe.exec(text)) !== null) {
    const w = m[1];
    if (!STOP.has(w)) counts[w] = (counts[w] || 0) + 3;
  }

  // Double-weight words that appear in the title (they define the role)
  (title || "")
    .toLowerCase()
    .split(/\s+/)
    .forEach((w) => {
      if (w && !STOP.has(w) && counts[w]) {
        counts[w] = (counts[w] || 0) + 2;
      }
    });

  // Sort by score
  const sorted = Object.entries(counts)
    .filter(([w]) => w.length > 2 && !STOP.has(w))
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w);

  // Deduplicate (don't include substrings of already-selected keywords)
  const result = [];
  const seen = new Set();
  for (const kw of sorted) {
    const isDup = result.some((r) => r.includes(kw) || kw.includes(r));
    if (!isDup && !seen.has(kw)) {
      seen.add(kw);
      result.push(kw);
      if (result.length >= 10) break;
    }
  }

  return result;
}

// ─── Job analyzer ──────────────────────────────────────────────────────────

function analyzeJob(job) {
  const text = (
    (job.title || "") +
    " " +
    (job.description || "")
  ).toLowerCase();

  let experienceLevel = "Mid Level";
  if (text.includes("intern")) experienceLevel = "Internship";
  else if (
    text.includes("new grad") ||
    text.includes("fresh graduate") ||
    text.includes("recent graduate")
  )
    experienceLevel = "New Grad";
  else if (
    text.includes("entry level") ||
    text.includes("entry-level") ||
    text.includes("junior") ||
    text.includes("0-2 year") ||
    text.includes("0 - 2 year")
  )
    experienceLevel = "Entry Level";
  else if (
    text.includes("senior") ||
    text.includes("sr.") ||
    text.includes("5+ year") ||
    text.includes("7+ year") ||
    text.includes("8+ year")
  )
    experienceLevel = "Senior";
  else if (
    text.includes("staff engineer") ||
    text.includes("principal") ||
    text.includes("lead engineer") ||
    text.includes("engineering lead")
  )
    experienceLevel = "Lead";

  let roleCategory = "Software";
  if (
    text.includes("machine learning") ||
    text.includes(" llm") ||
    text.includes("artificial intelligence") ||
    text.includes("deep learning") ||
    text.includes("computer vision")
  )
    roleCategory = "AI";
  else if (
    text.includes("data scientist") ||
    text.includes("data engineer") ||
    text.includes("data analyst") ||
    text.includes("analytics engineer")
  )
    roleCategory = "Data";
  else if (
    text.includes("product manager") ||
    text.includes("product owner") ||
    text.includes("product lead")
  )
    roleCategory = "Product";
  else if (
    text.includes("business analyst") ||
    text.includes("business development") ||
    text.includes("operations manager") ||
    text.includes("biz ops")
  )
    roleCategory = "Business";
  else if (
    text.includes("research scientist") ||
    text.includes("research engineer") ||
    text.includes("applied research")
  )
    roleCategory = "Research";

  let difficulty = "Medium";
  if (
    experienceLevel === "Internship" ||
    experienceLevel === "Entry Level" ||
    experienceLevel === "New Grad"
  )
    difficulty = "Easy";
  else if (experienceLevel === "Senior" || experienceLevel === "Lead")
    difficulty = "Hard";

  const techKeywords = [
    "React",
    "Python",
    "JavaScript",
    "TypeScript",
    "Node.js",
    "Java",
    "Go",
    "Rust",
    "C++",
    "C#",
    "AWS",
    "GCP",
    "Azure",
    "Docker",
    "Kubernetes",
    "Machine Learning",
    "AI",
    "Backend",
    "Frontend",
    "Full Stack",
    "DevOps",
    "Cloud",
    "Startup",
    "Remote",
    "Fintech",
    "Healthcare",
    "E-commerce",
    "GraphQL",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "Kafka",
    "Terraform",
    "Swift",
    "Kotlin",
    "Flutter",
    "React Native",
    "Next.js",
    "Django",
    "FastAPI",
    "Spring",
    "Microservices",
    "CI/CD",
    "Agile",
    "Scrum",
    "Spark",
    "Hadoop",
    "Snowflake",
    "dbt",
    "Databricks",
    "Tableau",
    "Salesforce",
    "SQL",
    "R",
  ];

  const tags = techKeywords.filter((kw) => text.includes(kw.toLowerCase()));
  if ((job.workplaceType || "").toLowerCase() === "remote") tags.push("Remote");
  if (job.easyApply) tags.push("Easy Apply");

  const techTerms = [
    "React",
    "Python",
    "JavaScript",
    "TypeScript",
    "Node.js",
    "Java",
    "Go",
    "Rust",
    "C++",
    "C#",
    "AWS",
    "GCP",
    "Azure",
    "Docker",
    "Kubernetes",
    "GraphQL",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "Kafka",
    "Terraform",
    "Swift",
    "Kotlin",
    "Flutter",
    "React Native",
    "Next.js",
    "Django",
    "FastAPI",
    "Spring",
    "Spark",
    "SQL",
    "R",
    "dbt",
  ];

  const skills = techTerms.filter((kw) => text.includes(kw.toLowerCase()));

  return {
    experienceLevel,
    roleCategory,
    difficulty,
    tags: tags.slice(0, 8),
    skills: skills.slice(0, 6),
  };
}
