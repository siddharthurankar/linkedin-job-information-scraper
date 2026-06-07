/** True when match score came from the user's Gemini run (not server heuristic). */
export function isGeminiScore(job) {
  return job?.aiAnalysis?.scoredWithGemini === true;
}

export function canScore(settings) {
  return !!(
    settings?.geminiApiKey?.trim() &&
    settings?.resumeText?.trim()
  );
}

/** Match % to show in UI; hides legacy heuristic scores. */
export function getDisplayMatchScore(job, settings) {
  if (!canScore(settings)) return null;
  if (!isGeminiScore(job)) return null;
  const s = job?.aiAnalysis?.matchScore;
  return typeof s === "number" && s > 0 ? s : null;
}

export function scoreLabel(job, settings) {
  if (!settings?.geminiApiKey?.trim()) return "Add API key";
  if (!settings?.resumeText?.trim()) return "Add resume";
  if (isGeminiScore(job) && job?.aiAnalysis?.matchScore) return null;
  return "Score";
}
