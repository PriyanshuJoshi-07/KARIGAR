import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSeller, type DraftImage } from "./SellerContext";
import { api } from "../../services/api";
import { ErrorBanner } from "../../components/ErrorBanner";
import { isPersistentImageUrl, revokeIfBlob } from "../../utils/images";

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

  const persisted = draft.images.filter((img) => isPersistentImageUrl(img.persistentUrl));

  async function addFiles(files: FileList | null) {
    setErr(null);
    if (!files?.length) return;
    if (draft.images.length + files.length > MAX) {
      setErr(t("tooManyImages"));
      return;
    }

    setBusy(true);
    const next: DraftImage[] = [...draft.images];
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          setErr(t("invalidImage"));
          continue;
        }
        const previewUrl = URL.createObjectURL(file);
        try {
          const res = await api.analyzeImage(file, file.name);
          if (!isPersistentImageUrl(res.imageUrl)) {
            revokeIfBlob(previewUrl);
            setErr(t("failedUpload"));
            return;
          }
          revokeIfBlob(previewUrl);
          const stored: DraftImage = {
            url: res.imageUrl!,
            previewUrl: res.imageUrl!,
            persistentUrl: res.imageUrl,
            name: file.name
          };
          next.push(stored);
          if (!draft.analysis || next.length === 1) {
            patch({
              analysis: res.analysis,
              material: draft.material || res.analysis.material,
              productName: draft.productName || res.analysis.productType
            });
          }
        } catch (e) {
          revokeIfBlob(previewUrl);
          setErr(e instanceof Error ? e.message : t("failedUpload"));
          return;
        }
      }
      patch({
        images: next,
        chosenUrls: next.map((i) => i.persistentUrl!).filter((url) => isPersistentImageUrl(url))
      });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
      if (camRef.current) camRef.current.value = "";
    }
  }

  async function improve(i: number) {
    const img = draft.images[i];
    if (!img?.persistentUrl) {
      setErr(t("failedUpload"));
      return;
    }
    setBusy(true);
    try {
      const res = await api.enhanceImage(img.persistentUrl);
      const enhancedUrl = isPersistentImageUrl(res.enhancedUrl) ? res.enhancedUrl : img.persistentUrl;
      patch({ enhanced: { ...draft.enhanced, [img.persistentUrl]: enhancedUrl } });
      setEnhanceIdx(i);
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("aiUnavailable"));
    } finally {
      setBusy(false);
    }
  }

  function goNext() {
    if (!persisted.length) {
      setErr(t("failedUpload"));
      return;
    }
    nav("/sell/voice");
  }

  return (
    <div>
      <h1 className="font-display text-3xl">{t("photosTitle")}</h1>
      <p className="mt-2 text-clay-600">{t("photosHint")}</p>
      <div className="mt-4">
        <ErrorBanner message={err} />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button className="btn-primary" type="button" onClick={() => camRef.current?.click()} disabled={busy}>
          {t("capture")}
        </button>
        <button className="btn-secondary" type="button" onClick={() => fileRef.current?.click()} disabled={busy}>
          {t("upload")}
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
        <input
          ref={camRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          capture="environment"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>
      {busy && <p className="mt-3 text-sm text-clay-600">{t("analyzing")}</p>}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {draft.images.map((img, i) => (
          <figure key={img.persistentUrl || img.previewUrl} className="card overflow-hidden p-0">
            <img src={draft.chosenUrls[i] || img.previewUrl} alt="" className="aspect-square w-full object-cover" />
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
              <img src={draft.images[enhanceIdx].persistentUrl || draft.images[enhanceIdx].previewUrl} alt="" className="mt-1 rounded-lg" />
            </div>
            <div>
              <p className="text-xs text-clay-500">{t("after")}</p>
              <img
                src={draft.enhanced[draft.images[enhanceIdx].persistentUrl || ""] || draft.images[enhanceIdx].previewUrl}
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
                const key = draft.images[enhanceIdx].persistentUrl || "";
                urls[enhanceIdx] = draft.enhanced[key] || key;
                patch({ chosenUrls: urls.filter((url) => isPersistentImageUrl(url)) });
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
      <button className="btn-primary mt-8 w-full" type="button" disabled={persisted.length < 1 || busy} onClick={goNext}>
        {t("next")}
      </button>
    </div>
  );
}
