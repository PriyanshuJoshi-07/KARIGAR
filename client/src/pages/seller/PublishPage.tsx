import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSeller } from "./SellerContext";
import { api, formatInr } from "../../services/api";
import { ErrorBanner } from "../../components/ErrorBanner";
import { isPersistentImageUrl } from "../../utils/images";

const SLUGS: Record<string, string> = {
  Basket: "baskets",
  Vase: "pottery",
  Painting: "paintings",
  "Wooden craft": "wood",
  Lamp: "lamps",
  Textile: "textiles"
};

export function PublishPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { draft, patch } = useSeller();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const d = draft.description;

  async function publish() {
    if (!d || !draft.basePrice) {
      setErr(t("emptyDetails"));
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const imageUrls = (draft.chosenUrls.length ? draft.chosenUrls : draft.images.map((i) => i.persistentUrl || i.url)).filter(
        (url) => isPersistentImageUrl(url)
      );
      if (!imageUrls.length) {
        setErr(t("failedUpload"));
        setBusy(false);
        return;
      }
      const images = imageUrls.map((url) => ({
        url,
        alt: d.title
      }));
      const res = await api.createProduct({
        title: d.title,
        shortDescription: d.shortDescription,
        longDescription: d.longDescription,
        material: d.material,
        craft: d.craft,
        features: d.features,
        artisanStory: d.artisanStory,
        basePrice: draft.basePrice,
        sellerName: draft.artisanName || "Guest artisan",
        originState: draft.originState,
        originCity: draft.originCity || "Village",
        size: draft.size,
        categorySlug: d.categorySlug || SLUGS[draft.analysis?.productType || ""] || "pottery",
        images,
        promotion: draft.promotion
      });
      patch({ publishedId: res.product.id });
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("dbError"));
    } finally {
      setBusy(false);
    }
  }

  if (draft.publishedId) {
    return (
      <div className="card text-center">
        <h1 className="font-display text-3xl">{t("published")}</h1>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button className="btn-primary" type="button" onClick={() => nav(`/product/${draft.publishedId}`)}>
            {t("viewListing")}
          </button>
          <button className="btn-secondary" type="button" onClick={() => nav("/market")}>
            {t("goMarketplace")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl">{t("publishTitle")}</h1>
      <p className="mt-2 text-clay-600">{t("publishHint")}</p>
      <div className="mt-3">
        <ErrorBanner message={err} />
      </div>
      <div className="card mt-6">
        <h2 className="font-display text-2xl">{d?.title || draft.productName}</h2>
        <p className="text-clay-600">{d?.shortDescription}</p>
        {draft.basePrice && <p className="mt-2 font-semibold">{formatInr(draft.basePrice)}</p>}
        <p className="text-sm text-clay-500">
          {draft.originCity} {draft.originState} · {d?.craft}
        </p>
      </div>
      <button className="btn-primary mt-8 w-full" type="button" onClick={publish} disabled={busy}>
        {busy ? t("publishing") : t("publish")}
      </button>
    </div>
  );
}
