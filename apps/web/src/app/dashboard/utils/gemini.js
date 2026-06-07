const GEMINI_MODEL = "gemini-2.0-flash";

const SCORE_SCHEMA = `{
  "matchScore": <integer 0-100>,
  "reasoning": "<one or two sentences comparing resume to job>",
  "missingGaps": ["<skill or requirement gap>", "..."]
}`;

function buildPrompt(resume, job) {
  const desc = (job.description || "").slice(0, 12000);
  return `You are a career coach. Compare this candidate's resume to the job posting and score how well the resume fits THIS specific role.

Return ONLY valid JSON matching this schema (no markdown):
${SCORE_SCHEMA}

Rules:
- matchScore: 0 = no fit, 100 = excellent fit for this exact role
- missingGaps: up to 5 concrete gaps (skills, experience, certs) the job asks for that the resume lacks or barely shows
- Base the score only on evidence in the resume vs the job description; do not assume skills not listed

RESUME:
${resume.slice(0, 14000)}

JOB:
Title: ${job.title || "Unknown"}
Company: ${job.company || "Unknown"}
Location: ${job.location || "Unknown"}
Workplace: ${job.workplaceType || "Unknown"}

Description:
${desc || "(no description scraped — score using title and metadata only)"}`;
}

function parseGeminiJson(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1].trim() : trimmed;
  const parsed = JSON.parse(raw);

  const matchScore = Math.round(Number(parsed.matchScore));
  if (Number.isNaN(matchScore) || matchScore < 0 || matchScore > 100) {
    throw new Error("Invalid matchScore from Gemini");
  }

  const reasoning =
    typeof parsed.reasoning === "string"
      ? parsed.reasoning.trim()
      : "No reasoning provided.";

  const missingGaps = Array.isArray(parsed.missingGaps)
    ? parsed.missingGaps
        .filter((g) => typeof g === "string" && g.trim())
        .map((g) => g.trim())
        .slice(0, 5)
    : [];

  return { matchScore, reasoning, missingGaps };
}

export async function scoreJobWithGemini(apiKey, resume, job) {
  const key = apiKey?.trim();
  if (!key) throw new Error("Add your Gemini API key in Settings.");
  if (!resume?.trim()) throw new Error("Add your resume in Settings.");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(key)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(resume.trim(), job) }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      data?.error?.message ||
      data?.error?.status ||
      `Gemini API error (${res.status})`;
    throw new Error(msg);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");

  try {
    return parseGeminiJson(text);
  } catch {
    throw new Error("Could not parse Gemini response. Try again.");
  }
}
