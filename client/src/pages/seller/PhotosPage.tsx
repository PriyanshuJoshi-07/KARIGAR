import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSeller } from "./SellerContext";
import { api } from "../../services/api";
import { ErrorBanner } from "../../components/ErrorBanner";

const MAX = 3;

export function PhotosPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { draft, patch } = useSeller();
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [enhanceIdx, setEnhanceIdx] = useState<number | null>(null);

  async function addFiles(files: FileList | null) {
    setErr(null);
    if (!files?.length) return;
    if (draft.images.length + files.length > MAX) {
      setErr(t("tooManyImages"));
      return;
    }
    const next = [...draft.images];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        setErr(t("invalidImage"));
        continue;
      }
      const url = URL.createObjectURL(file);
      next.push({ url, file, name: file.name });
    }
    if (next.length > MAX) {
      setErr(t("tooManyImages"));
      return;
    }
    patch({ images: next, chosenUrls: next.map((i) => i.url) });
    const first = next[0];
    if (first?.file) {
      setBusy(true);
      try {
        const res = await api.analyzeImage(first.file, first.name);
        patch({
          analysis: res.analysis,
          material: res.analysis.material,
          productName: draft.productName || res.analysis.productType
        });
      } catch (e) {
        setErr(e instanceof Error ? e.message : t("failedUpload"));
      } finally {
        setBusy(false);
      }
    }
  }

  async function improve(i: number) {
    const img = draft.images[i];
    if (!img) return;
    setBusy(true);
    try {
      const res = await api.enhanceImage(img.url);
      patch({ enhanced: { ...draft.enhanced, [img.url]: res.enhancedUrl } });
      setEnhanceIdx(i);
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("aiUnavailable"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl">{t("photosTitle")}</h1>
      <p className="mt-2 text-clay-600">{t("photosHint")}</p>
      <div className="mt-4">
        <ErrorBanner message={err} />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button className="btn-primary" type="button" onClick={() => camRef.current?.click()}>
          {t("capture")}
        </button>
        <button className="btn-secondary" type="button" onClick={() => fileRef.current?.click()}>
          {t("upload")}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
        <input
          ref={camRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>
      {busy && <p className="mt-3 text-sm text-clay-600">{t("analyzing")}</p>}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {draft.images.map((img, i) => (
          <figure key={img.url} className="card overflow-hidden p-0">
            <img src={draft.chosenUrls[i] || img.url} alt="" className="aspect-square w-full object-cover" />
            <figcaption className="p-3 text-xs">
              <button className="text-clay-700 underline" type="button" onClick={() => improve(i)}>
                {t("improvePhoto")}
              </button>
            </figcaption>
          </figure>
        ))}
      </div>
      {enhanceIdx !== null && draft.images[enhanceIdx] && (
        <div className="card mt-6">
          <p className="font-medium">{t("improveHint")}</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-clay-500">{t("before")}</p>
              <img src={draft.images[enhanceIdx].url} alt="" className="mt-1 rounded-lg" />
            </div>
            <div>
              <p className="text-xs text-clay-500">{t("after")}</p>
              <img
                src={draft.enhanced[draft.images[enhanceIdx].url] || draft.images[enhanceIdx].url}
                alt=""
                className="mt-1 rounded-lg brightness-110 contrast-105"
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              className="btn-primary"
              type="button"
              onClick={() => {
                const urls = [...draft.chosenUrls];
                urls[enhanceIdx] = draft.enhanced[draft.images[enhanceIdx].url] || draft.images[enhanceIdx].url;
                patch({ chosenUrls: urls });
                setEnhanceIdx(null);
              }}
            >
              {t("yesImprove")}
            </button>
            <button className="btn-secondary" type="button" onClick={() => setEnhanceIdx(null)}>
              {t("keepOriginal")}
            </button>
          </div>
        </div>
      )}
      {draft.analysis && (
        <div className="card mt-6">
          <p className="text-sm uppercase tracking-wide text-clay-500">{t("detected")}</p>
          <p className="font-display text-xl">
            {draft.analysis.productType} · {draft.analysis.material}
          </p>
          <p className="text-sm text-clay-600">{draft.analysis.notes}</p>
          <p className="mt-1 text-xs text-clay-500">
            {t("confidence")}: {Math.round(draft.analysis.confidence * 100)}%
            {draft.analysis.demo ? " · demo" : ""}
          </p>
        </div>
      )}
      <button
        className="btn-primary mt-8 w-full"
        type="button"
        disabled={draft.images.length < 1}
        onClick={() => nav("/sell/voice")}
      >
        {t("next")}
      </button>
    </div>
  );
}
