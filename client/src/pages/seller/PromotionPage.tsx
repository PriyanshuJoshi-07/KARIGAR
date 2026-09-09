import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSeller } from "./SellerContext";
import { api } from "../../services/api";
import { ErrorBanner } from "../../components/ErrorBanner";

export function PromotionPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { draft, patch } = useSeller();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const p = draft.promotion;

  async function generate() {
    setBusy(true);
    setErr(null);
    try {
      const res = await api.generatePromotion({
        title: draft.description?.title || draft.productName,
        craft: draft.description?.craft || draft.analysis?.craft || "handmade",
        artisanName: draft.artisanName,
        originCity: draft.originCity,
        originState: draft.originState,
        material: draft.material
      });
      patch({ promotion: res });
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("aiUnavailable"));
    } finally {
      setBusy(false);
    }
  }

  function download() {
    if (!p) return;
    const blob = new Blob(
      [`${p.reelText}\n\n${p.script}\n\n${p.caption}\n\n${p.hashtags.join(" ")}`],
      { type: "text/plain" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "karigar-promotion.txt";
    a.click();
  }

  async function share() {
    if (!p) return;
    const text = `${p.caption}\n${p.hashtags.join(" ")}`;
    if (navigator.share) {
      await navigator.share({ title: "KARIGAR", text }).catch(() => null);
    } else {
      await navigator.clipboard.writeText(text);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl">{t("promoTitle")}</h1>
      <p className="mt-2 text-clay-600">{t("promoHint")}</p>
      <div className="mt-3">
        <ErrorBanner message={err} />
      </div>
      <button className="btn-primary mt-4" type="button" onClick={generate} disabled={busy}>
        {busy ? t("regenerating") : t("regenerate")}
      </button>
      {p && (
        <div className="card mt-6 space-y-3">
          <div className="rounded-xl bg-ink px-4 py-8 text-center text-cream">
            <p className="whitespace-pre-line font-display text-xl">{p.reelText}</p>
            <p className="mt-2 text-xs text-clay-200">demo reel preview</p>
          </div>
          <p>
            <span className="text-sm font-medium">{t("script")}</span>
            <br />
            {p.script}
          </p>
          <p>
            <span className="text-sm font-medium">{t("caption")}</span>
            <br />
            {p.caption}
          </p>
          <p className="text-sm text-clay-700">{p.hashtags.join(" ")}</p>
          <div className="flex gap-2">
            <button className="btn-secondary" type="button" onClick={download}>
              {t("download")}
            </button>
            <button className="btn-secondary" type="button" onClick={share}>
              {t("share")}
            </button>
          </div>
        </div>
      )}
      <button className="btn-primary mt-8 w-full" type="button" onClick={() => nav("/sell/publish")}>
        {t("next")}
      </button>
    </div>
  );
}
