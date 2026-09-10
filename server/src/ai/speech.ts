import { config } from "../utils/config.js";
import { parsePriceFromSpeech } from "../utils/sanitize.js";
import { extractDetailsFromTranscript, type ExtractedDetails } from "./extract.js";

export interface TranscriptResult extends ExtractedDetails {
  transcript: string;
  language: string;
  parsedPrice: number | null;
  demo: boolean;
}

export async function transcribe(opts: {
  text?: string;
  language?: string;
}): Promise<TranscriptResult> {
  const transcript = (opts.text || "").trim();
  const extracted = extractDetailsFromTranscript(transcript);
  return {
    transcript,
    language: opts.language || "hi",
    parsedPrice: parsePriceFromSpeech(transcript),
    demo: config.demoMode || !process.env.SPEECH_API_KEY,
    ...extracted
  };
}
