import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSeller } from "./SellerContext";
import { api } from "../../services/api";
import { ErrorBanner } from "../../components/ErrorBanner";

export function DescriptionPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { draft, patch } = useSeller();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const d = draft.description;

  async function generate() {
    setBusy(true);
    setErr(null);
    try {
      const res = await api.generateProduct({
        transcript: draft.transcript,
        productName: draft.productName,
        material: draft.material,
        duration: draft.duration,
        extra: draft.extra,
        productType: draft.analysis?.productType || "",
        craft: draft.analysis?.craft || draft.description?.craft || "",
        artisanName: draft.artisanName,
        originCity: draft.originCity,
        originState: draft.originState,
        imageUrl: draft.chosenUrls[0] || "",
        size: draft.size
      });
      patch({
        description: res,
        productName: res.title || draft.productName,
        material: res.material || draft.material,
        basePrice: res.suggestedPrice || draft.basePrice
      });
      if (res.craft) {
        await api.research(res.craft).catch(() => null);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("aiUnavailable"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl">{t("sellerSteps.description")}</h1>
      <div className="mt-3">
        <ErrorBanner message={err} />
      </div>
      <button className="btn-primary mt-4" type="button" onClick={generate} disabled={busy}>
        {busy ? t("regenerating") : d ? t("regenerate") : t("generateDescription")}
      </button>
      {d && (
        <div className="mt-6 grid gap-3">
          <label>
            <span className="text-sm">{t("titleField")}</span>
            <input className="input mt-1" value={d.title} onChange={(e) => patch({ description: { ...d, title: e.target.value } })} />
          </label>
          <label>
            <span className="text-sm">{t("shortDesc")}</span>
            <textarea className="input mt-1" rows={2} value={d.shortDescription} onChange={(e) => patch({ description: { ...d, shortDescription: e.target.value } })} />
          </label>
          <label>
            <span className="text-sm">{t("longDesc")}</span>
            <textarea className="input mt-1" rows={5} value={d.longDescription} onChange={(e) => patch({ description: { ...d, longDescription: e.target.value } })} />
          </label>
          <label>
            <span className="text-sm">{t("artisanStory")}</span>
            <textarea className="input mt-1" rows={3} value={d.artisanStory} onChange={(e) => patch({ description: { ...d, artisanStory: e.target.value } })} />
          </label>
          <p className="text-xs text-clay-500">{d.demo ? t("demoBanner") : ""}</p>
        </div>
      )}
      <button className="btn-primary mt-8 w-full" type="button" disabled={!d} onClick={() => nav("/sell/price")}>
        {t("next")}
      </button>
    </div>
  );
}
