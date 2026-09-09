import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, formatInr, guestId, type Product } from "../services/api";
import { Stars } from "../components/Stars";
import { ErrorBanner } from "../components/ErrorBanner";

export function ProductPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const nav = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!id) return;
    api
      .product(id)
      .then((r) => setProduct(r.product))
      .catch((e) => setErr(e instanceof Error ? e.message : t("networkError")));
  }, [id, t]);

  if (err) return <ErrorBanner message={err} />;
  if (!product) return <p className="text-clay-600">…</p>;
  const listing = product;
  const img = listing.images[active] || listing.images[0];

  async function add(buy = false) {
    setErr(null);
    try {
      await api.addToCart(guestId(), listing.id, 1);
      setMsg(t("added"));
      if (buy) nav("/checkout");
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("networkError"));
    }
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: listing.title, url }).catch(() => null);
    } else {
      await navigator.clipboard.writeText(url);
      setMsg(t("shareCopied"));
    }
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.createReview({ productId: listing.id, rating: stars, text, guestId: guestId(), reviewerName: "Guest buyer" });
      const r = await api.product(listing.id);
      setProduct(r.product);
      setText("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("networkError"));
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        {img && <img src={img.url} alt={img.alt} className="w-full rounded-2xl border border-clay-100 bg-white object-cover" />}
        {product.images.length > 1 && (
          <div className="mt-3 flex gap-2">
            {product.images.map((im, i) => (
              <button key={im.id} type="button" onClick={() => setActive(i)} className="h-16 w-16 overflow-hidden rounded-lg border">
                <img src={im.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm uppercase tracking-wide text-clay-500">{product.category.name}</p>
        <h1 className="font-display text-3xl">{product.title}</h1>
        <p className="mt-2 text-2xl font-semibold">{formatInr(product.basePrice)}</p>
        <div className="mt-1 flex items-center gap-2">
          <Stars value={Math.round(product.rating)} />
          <span className="text-sm text-clay-600">
            {product.rating} · {product.reviewCount} {t("reviews")}
          </span>
        </div>
        <p className="mt-4 text-clay-700">{product.shortDescription}</p>
        <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-clay-500">{t("artisan")}</dt>
            <dd>{product.seller.user.name}</dd>
          </div>
          <div>
            <dt className="text-clay-500">{t("from")}</dt>
            <dd>
              {product.originCity}, {product.originState}
            </dd>
          </div>
          <div>
            <dt className="text-clay-500">{t("material")}</dt>
            <dd>{product.material}</dd>
          </div>
          <div>
            <dt className="text-clay-500">{t("craft")}</dt>
            <dd>{product.craft}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="btn-primary" type="button" onClick={() => add(false)}>
            {t("addToCart")}
          </button>
          <button className="btn-secondary" type="button" onClick={() => add(true)}>
            {t("buyNow")}
          </button>
          <button className="btn-secondary" type="button" onClick={share}>
            {t("share")}
          </button>
        </div>
        <div className="mt-3">
          <ErrorBanner message={err} />
          {msg && <p className="text-sm text-clay-700">{msg}</p>}
        </div>
        <section className="mt-8">
          <h2 className="font-display text-xl">{t("description")}</h2>
          <p className="mt-2 whitespace-pre-line text-clay-700">{product.longDescription}</p>
          <p className="mt-3 text-sm">{product.artisanStory}</p>
          <ul className="mt-3 list-disc pl-5 text-sm">
            {(product.features || []).map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>
        <section className="mt-8">
          <h2 className="font-display text-xl">{t("reviews")}</h2>
          <ul className="mt-3 space-y-3">
            {(product.reviews || []).map((r) => (
              <li key={r.id} className="rounded-xl bg-clay-50 p-3">
                <Stars value={r.rating} />
                <p className="mt-1 text-sm">{r.text}</p>
                <p className="text-xs text-clay-500">{r.user.name}</p>
              </li>
            ))}
          </ul>
          <form className="card mt-4" onSubmit={submitReview}>
            <h3 className="font-medium">{t("writeReview")}</h3>
            <Stars value={stars} onChange={setStars} />
            <textarea className="input mt-2" rows={3} placeholder={t("reviewPlaceholder")} value={text} onChange={(e) => setText(e.target.value)} />
            <button className="btn-primary mt-3" type="submit">
              {t("submitReview")}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
