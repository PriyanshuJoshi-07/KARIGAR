import sanitizeHtml from "sanitize-html";

export function cleanText(input: unknown, max = 4000): string {
  if (typeof input !== "string") return "";
  const stripped = sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} });
  return stripped.replace(/\s+/g, " ").trim().slice(0, max);
}

export function parsePriceFromSpeech(text: string): number | null {
  const normalized = text.toLowerCase().replace(/,/g, "");
  const match = normalized.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value);
}
