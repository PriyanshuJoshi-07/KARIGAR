import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { api, type Product, type Category, type Artisan } from "../services/api";
import { ProductCard } from "../components/ProductCard";
import { ErrorBanner } from "../components/ErrorBanner";

export function MarketPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  async function load(params?: Record<string, string>) {
    setErr(null);
    try {
      const res = await api.products(params);
      setProducts(res.products);
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("networkError"));
    }
  }

  useEffect(() => {
    load();
    api.categories().then((r) => setCategories(r.categories)).catch(() => null);
    api.artisans().then((r) => setArtisans(r.artisans)).catch(() => null);
    api.demoStatus().then((r) => setNotice(r.notice)).catch(() => null);
  }, []);

  function applyFilters(e?: React.FormEvent) {
    e?.preventDefault();
    load({
      q,
      category,
      minPrice,
      maxPrice,
      minRating
    });
  }

  const recommended = useMemo(() => products.filter((p) => p.featured).slice(0, 4), [products]);
  const popular = useMemo(() => products.filter((p) => p.popular).slice(0, 6), [products]);

  return (
    <div>
      {notice && <p className="mb-4 rounded-xl bg-clay-100 px-4 py-3 text-sm text-clay-800">{notice}</p>}
      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={applyFilters}>
        <input className="input flex-1" placeholder={t("search")} value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn-primary" type="submit">
          {t("search")}
        </button>
      </form>
      <form className="mt-4 grid gap-3 rounded-2xl border border-clay-100 bg-white p-4 sm:grid-cols-4" onSubmit={applyFilters}>
        <label className="text-sm">
          {t("category")}
          <select className="input mt-1" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">{t("all")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          {t("min")}
          <input className="input mt-1" type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
        </label>
        <label className="text-sm">
          {t("max")}
          <input className="input mt-1" type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        </label>
        <label className="text-sm">
          {t("rating")}
          <select className="input mt-1" value={minRating} onChange={(e) => setMinRating(e.target.value)}>
            <option value="">{t("all")}</option>
            <option value="4">4 {t("andUp")}</option>
            <option value="3">3 {t("andUp")}</option>
          </select>
        </label>
        <div className="sm:col-span-4 flex gap-2">
          <button className="btn-secondary" type="submit">{t("apply")}</button>
          <button
            className="btn-secondary"
            type="button"
            onClick={() => {
              setQ("");
              setCategory("");
              setMinPrice("");
              setMaxPrice("");
              setMinRating("");
              load();
            }}
          >
            {t("clear")}
          </button>
        </div>
      </form>
      <div className="mt-3">
        <ErrorBanner message={err} />
      </div>
      {products.length === 0 && !err && <p className="mt-8 text-clay-600">{t("noResults")}</p>}

      <section className="mt-10">
        <h2 className="font-display text-2xl">{t("recommended")}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recommended.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl">{t("popular")}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl">{t("categories")}</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {categories.map((c) => (
            <button
              key={c.id}
              className="card text-left hover:shadow-lift"
              type="button"
              onClick={() => {
                setCategory(c.slug);
                load({ category: c.slug, q });
              }}
            >
              <p className="font-display text-lg">{c.name}</p>
              <p className="text-sm text-clay-500">{c.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl">{t("featuredArtisans")}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {artisans.map((a) => (
            <article key={a.id} className="card flex gap-3">
              {a.avatarUrl && <img src={a.avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover" />}
              <div>
                <h3 className="font-display text-lg">{a.user.name}</h3>
                <p className="text-sm text-clay-600">
                  {a.craft} · {a.originCity}, {a.originState}
                </p>
                <p className="mt-1 text-sm">{a.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl">{t("all")}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
