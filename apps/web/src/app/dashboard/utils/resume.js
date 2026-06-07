import { extractTextFromPDF } from "@/client-integrations/pdfjs";

export async function extractResumeText(file) {
  if (!file) return "";

  const name = (file.name || "").toLowerCase();

  if (name.endsWith(".txt") || file.type === "text/plain") {
    return await file.text();
  }

  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const text = await extractTextFromPDF(file);
    if (!text?.trim()) {
      throw new Error(
        "Could not read text from this PDF. Try a text-based PDF or paste your resume instead.",
      );
    }
    return text.trim();
  }

  throw new Error("Upload a .txt or .pdf file, or paste your resume.");
}
