import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LANGUAGES } from "@shared/constants";
import { useSpeech } from "../hooks/useSpeech";
import { setLang } from "../utils/session";
import { ErrorBanner } from "../components/ErrorBanner";

const SPEAK_HINTS: Record<string, string[]> = {
  en: ["english"],
  hi: ["hindi", "हिन्दी", "हिंदी"],
  bn: ["bengali", "bangla", "বাংলা"],
  mr: ["marathi", "मराठी"],
  te: ["telugu", "తెలుగు"],
  ta: ["tamil", "தமிழ்"],
  gu: ["gujarati", "ગુજરાતી"],
  kn: ["kannada", "ಕನ್ನಡ"],
  ml: ["malayalam", "മലയാളം"],
  pa: ["punjabi", "ਪੰਜਾਬੀ"],
  or: ["odia", "oriya", "ଓଡ଼ିଆ"],
  as: ["assamese", "অসমীয়া"],
  ur: ["urdu", "اردو"]
};

export function LanguagePage() {
  const { t, i18n } = useTranslation();
  const nav = useNavigate();
  const speech = useSpeech("hi");
  const [heard, setHeard] = useState("");
  const [err, setErr] = useState<string | null>(null);

  function choose(code: string) {
    setLang(code);
    i18n.changeLanguage(code);
    nav("/role");
  }

  function onSpeak() {
    setErr(null);
    if (!speech.supported) {
      setErr(t("speechUnsupported"));
      return;
    }
    speech.start((text) => {
      setHeard(text);
      const lower = text.toLowerCase();
      const match = Object.entries(SPEAK_HINTS).find(([, words]) => words.some((w) => lower.includes(w)));
      if (match) choose(match[0]);
    });
  }

  const speechErr =
    speech.error === "denied" ? t("micDenied") : speech.error === "unsupported" ? t("speechUnsupported") : err;

  return (
    <div className="mx-auto max-w-3xl">
      <p className="mb-4 rounded-xl bg-clay-100 px-4 py-3 text-sm text-clay-800">{t("demoBanner")}</p>
      <h1 className="font-display text-4xl">{t("chooseLanguage")}</h1>
      <p className="mt-2 text-clay-600">{t("tagline")}</p>
      <button className="btn-primary mt-6 w-full sm:w-auto" onClick={onSpeak} type="button">
        {speech.listening ? t("listening") : t("speakLanguage")}
      </button>
      {heard && (
        <p className="mt-2 text-sm text-clay-600">
          {t("languageDetected")}: {heard}
        </p>
      )}
      <div className="mt-3">
        <ErrorBanner message={speechErr} />
      </div>
      <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {LANGUAGES.map((l) => (
          <li key={l.code}>
            <button className="card w-full text-left hover:shadow-lift" onClick={() => choose(l.code)} type="button">
              <span className="block font-display text-xl">{l.native}</span>
              <span className="text-sm text-clay-500">{l.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
