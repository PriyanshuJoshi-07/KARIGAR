import { config } from "../utils/config.js";
import { parsePriceFromSpeech } from "../utils/sanitize.js";

export interface TranscriptResult {
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
  return {
    transcript,
    language: opts.language || "hi",
    parsedPrice: parsePriceFromSpeech(transcript),
    demo: config.demoMode || !process.env.SPEECH_API_KEY
  };
}
