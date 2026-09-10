import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { INDIAN_STATES } from "@shared/constants";
import { useSeller } from "./SellerContext";
import { useSpeech } from "../../hooks/useSpeech";
import { getLang } from "../../utils/session";
import { api, formatInr } from "../../services/api";
import { ErrorBanner } from "../../components/ErrorBanner";

export function PricePage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { draft, patch } = useSeller();
  const speech = useSpeech(getLang());
  const [err, setErr] = useState<string | null>(null);
  const [priceText, setPriceText] = useState(draft.basePrice ? String(draft.basePrice) : "");

  async function suggest() {
    setErr(null);
    try {
      const res = await api.suggestPrice({
        transcript: draft.transcript,
        productName: draft.productName,
        material: draft.material,
        duration: draft.duration,
        extra: draft.extra,
        craft: draft.description?.craft || draft.analysis?.craft || "",
        size: draft.size
      });
      patch({ basePrice: res.suggestedPrice });
      setPriceText(String(res.suggestedPrice));
      await calc(res.suggestedPrice);
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("networkError"));
    }
  }

  async function applyPrice(raw: string) {
    const res = await api.transcribe(raw, getLang()).catch((e) => {
      setErr(e instanceof Error ? e.message : t("networkError"));
      return null;
    });
    const n = res?.parsedPrice ?? Number(raw.replace(/[^\d.]/g, ""));
    if (!Number.isFinite(n) || n <= 0) {
      setErr(t("invalidPrice"));
      return;
    }
    patch({ basePrice: Math.round(n) });
    setPriceText(String(Math.round(n)));
    setErr(null);
    await calc(Math.round(n));
  }

  async function calc(price = draft.basePrice) {
    try {
      const delivery = await api.calculateDelivery({
        originState: draft.originState,
        destinationState: draft.destinationState,
        size: draft.size
      });
      patch({ delivery });
      if (price) patch({ basePrice: price });
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("networkError"));
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl">{t("priceTitle")}</h1>
      <p className="mt-2 text-clay-600">{t("priceHint")}</p>
      <div className="mt-3">
        <ErrorBanner message={err} />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          className="btn-primary"
          type="button"
          onClick={() => speech.start((text) => applyPrice(text))}
        >
          {speech.listening ? t("listening") : t("startTalking")}
        </button>
        <button className="btn-secondary" type="button" onClick={suggest}>
          {t("suggestedPrice")}
        </button>
      </div>
      <label className="mt-4 block">
        <span className="text-sm">{t("basePrice")}</span>
        <input
          className="input mt-1"
          value={priceText}
          onChange={(e) => setPriceText(e.target.value)}
          onBlur={() => applyPrice(priceText)}
        />
      </label>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label>
          <span className="text-sm">{t("originState")}</span>
          <select className="input mt-1" value={draft.originState} onChange={(e) => patch({ originState: e.target.value })}>
            {INDIAN_STATES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-sm">{t("originCity")}</span>
          <input className="input mt-1" value={draft.originCity} onChange={(e) => patch({ originCity: e.target.value })} />
        </label>
        <label>
          <span className="text-sm">{t("destination")}</span>
          <select
            className="input mt-1"
            value={draft.destinationState}
            onChange={(e) => patch({ destinationState: e.target.value })}
          >
            {INDIAN_STATES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-sm">{t("size")}</span>
          <select className="input mt-1" value={draft.size} onChange={(e) => patch({ size: e.target.value })}>
            <option value="small">{t("small")}</option>
            <option value="medium">{t("medium")}</option>
            <option value="large">{t("large")}</option>
          </select>
        </label>
      </div>
      <button className="btn-secondary mt-4" type="button" onClick={() => calc()}>
        {t("delivery")}
      </button>
      {draft.delivery && draft.basePrice && (
        <div className="card mt-6">
          <h2 className="font-display text-xl">{t("breakdown")}</h2>
          <ul className="mt-2 space-y-1 text-sm">
            <li className="flex justify-between">
              <span>{t("productPrice")}</span>
              <span>{formatInr(draft.basePrice)}</span>
            </li>
            <li className="flex justify-between">
              <span>{t("deliveryFee")}</span>
              <span>{formatInr(draft.delivery.total)}</span>
            </li>
            <li className="flex justify-between font-semibold">
              <span>{t("total")}</span>
              <span>{formatInr(draft.basePrice + draft.delivery.total)}</span>
            </li>
            <li className="text-clay-500">
              {t("eta")}: {draft.delivery.etaDays}
            </li>
          </ul>
        </div>
      )}
      <button
        className="btn-primary mt-8 w-full"
        type="button"
        disabled={!draft.basePrice}
        onClick={() => nav("/sell/promotion")}
      >
        {t("next")}
      </button>
    </div>
  );
}
