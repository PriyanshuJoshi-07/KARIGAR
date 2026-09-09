import { useCallback, useRef, useState } from "react";
import { SPEECH_LANG_MAP } from "@shared/constants";

type SpeechWindow = Window &
  typeof globalThis & {
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    SpeechRecognition?: new () => SpeechRecognitionLike;
  };

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((ev: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export function useSpeech(langCode: string) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  const supported =
    typeof window !== "undefined" &&
    Boolean((window as SpeechWindow).webkitSpeechRecognition || (window as SpeechWindow).SpeechRecognition);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(
    (onText: (text: string) => void) => {
      setError(null);
      const Ctor =
        (window as SpeechWindow).webkitSpeechRecognition || (window as SpeechWindow).SpeechRecognition;
      if (!Ctor) {
        setError("unsupported");
        return;
      }
      const rec = new Ctor();
      rec.lang = SPEECH_LANG_MAP[langCode] || "hi-IN";
      rec.interimResults = false;
      rec.continuous = false;
      rec.onresult = (ev) => {
        const text = ev.results[0]?.[0]?.transcript || "";
        onText(text);
      };
      rec.onerror = (ev) => {
        setError(ev.error === "not-allowed" ? "denied" : ev.error);
        setListening(false);
      };
      rec.onend = () => setListening(false);
      recRef.current = rec;
      try {
        rec.start();
        setListening(true);
      } catch {
        setError("unsupported");
      }
    },
    [langCode]
  );

  return { supported, listening, error, start, stop };
}
