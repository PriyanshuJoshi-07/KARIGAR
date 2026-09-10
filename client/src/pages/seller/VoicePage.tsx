import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSeller } from "./SellerContext";
import { useSpeech } from "../../hooks/useSpeech";
import { getLang } from "../../utils/session";
import { api } from "../../services/api";
import { ErrorBanner } from "../../components/ErrorBanner";

export function VoicePage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { draft, patch } = useSeller();
  const speech = useSpeech(getLang());
  const [err, setErr] = useState<string | null>(null);

  async function applyTranscript(text: string, replace = false) {
    const incoming = text.trim();
    if (!incoming) return;
    let combined = incoming;
    if (!replace && draft.transcript) {
      const existing = draft.transcript.trim();
      if (incoming.includes(existing)) combined = incoming;
      else if (existing.includes(incoming)) combined = existing;
      else combined = `${existing} ${incoming}`;
    }
    patch({ transcript: combined });
    try {
      const res = await api.transcribe(combined, getLang());
      patch({
        transcript: res.transcript || combined,
        productName: res.productName || draft.productName,
        material: res.material || draft.material,
        duration: res.duration || draft.duration,
        extra: res.extra || draft.extra
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("networkError"));
    }
  }

  async function onHeard(text: string) {
    await applyTranscript(text);
  }

  function goNext() {
    if (!draft.productName && !draft.transcript && !draft.extra) {
      setErr(t("emptyDetails"));
      return;
    }
    nav("/sell/description");
  }

  const speechErr =
    speech.error === "denied" ? t("micDenied") : speech.error === "unsupported" ? t("speechUnsupported") : err;

  return (
    <div>
      <h1 className="font-display text-3xl">{t("voiceTitle")}</h1>
      <p className="mt-2 text-clay-600">{t("voiceHint")}</p>
      <div className="mt-3">
        <ErrorBanner message={speechErr} />
      </div>
      <button
        className="btn-primary mt-4"
        type="button"
        onClick={() => (speech.listening ? speech.stop() : speech.start(onHeard))}
      >
        {speech.listening ? t("stopTalking") : t("startTalking")}
      </button>
      {draft.transcript && (
        <p className="mt-3 rounded-xl bg-clay-50 px-4 py-3 text-sm">
          <span className="font-medium">{t("transcript")}: </span>
          {draft.transcript}
        </p>
      )}
      <div className="mt-6 grid gap-3">
        <label>
          <span className="text-sm text-clay-600">{t("productName")}</span>
          <input className="input mt-1" value={draft.productName} onChange={(e) => patch({ productName: e.target.value })} />
        </label>
        <label>
          <span className="text-sm text-clay-600">{t("material")}</span>
          <input className="input mt-1" value={draft.material} onChange={(e) => patch({ material: e.target.value })} />
        </label>
        <label>
          <span className="text-sm text-clay-600">{t("duration")}</span>
          <input className="input mt-1" value={draft.duration} onChange={(e) => patch({ duration: e.target.value })} />
        </label>
        <label>
          <span className="text-sm text-clay-600">{t("extra")}</span>
          <textarea className="input mt-1" rows={3} value={draft.extra} onChange={(e) => patch({ extra: e.target.value })} />
        </label>
        <label>
          <span className="text-sm text-clay-600">{t("typeInstead")}</span>
          <textarea
            className="input mt-1"
            rows={3}
            value={draft.transcript}
            onChange={(e) => patch({ transcript: e.target.value })}
            onBlur={() => {
              if (draft.transcript) applyTranscript(draft.transcript, true);
            }}
          />
        </label>
        <label>
          <span className="text-sm text-clay-600">{t("artisan")}</span>
          <input className="input mt-1" value={draft.artisanName} onChange={(e) => patch({ artisanName: e.target.value })} />
        </label>
      </div>
      <button className="btn-primary mt-8 w-full" type="button" onClick={goNext}>
        {t("next")}
      </button>
    </div>
  );
}
