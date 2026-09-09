import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, formatInr, guestId, type Cart } from "../services/api";
import { ErrorBanner } from "../components/ErrorBanner";

export function CartPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [subtotal, setSubtotal] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      const r = await api.getCart(guestId());
      setCart(r.cart);
      setSubtotal(r.subtotal);
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("networkError"));
    }
  }

  useEffect(() => {
    load();
  }, []);

  const items = cart?.items || [];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl">{t("cart")}</h1>
      <div className="mt-3">
        <ErrorBanner message={err} />
      </div>
      {items.length === 0 ? (
        <p className="mt-6 text-clay-600">
          {t("emptyCart")}{" "}
          <Link className="underline" to="/market">
            {t("goMarketplace")}
          </Link>
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((i) => (
            <li key={i.id} className="card flex items-center gap-3">
              {i.product.images[0] && (
                <img src={i.product.images[0].url} alt="" className="h-20 w-20 rounded-lg object-cover" />
              )}
              <div className="flex-1">
                <Link to={`/product/${i.product.id}`} className="font-display text-lg">
                  {i.product.title}
                </Link>
                <p className="text-sm">{formatInr(i.product.basePrice)}</p>
              </div>
              <input
                className="input w-20"
                type="number"
                min={1}
                value={i.quantity}
                onChange={async (e) => {
                  await api.updateCart(guestId(), i.product.id, Number(e.target.value));
                  load();
                }}
              />
              <button
                className="text-sm text-madder"
                type="button"
                onClick={async () => {
                  await api.updateCart(guestId(), i.product.id, 0);
                  load();
                }}
              >
                {t("remove")}
              </button>
            </li>
          ))}
        </ul>
      )}
      {items.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-lg font-semibold">
            {t("subtotal")}: {formatInr(subtotal)}
          </p>
          <button className="btn-primary" type="button" onClick={() => nav("/checkout")}>
            {t("checkout")}
          </button>
        </div>
      )}
    </div>
  );
}
