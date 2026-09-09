import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { INDIAN_STATES } from "@shared/constants";
import { api, formatInr, guestId, type Cart, type DeliveryEstimate } from "../services/api";
import { ErrorBanner } from "../components/ErrorBanner";

export function CheckoutPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [subtotal, setSubtotal] = useState(0);
  const [name, setName] = useState("");
  const [state, setState] = useState("Maharashtra");
  const [city, setCity] = useState("");
  const [delivery, setDelivery] = useState<DeliveryEstimate | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getCart(guestId()).then((r) => {
      setCart(r.cart);
      setSubtotal(r.subtotal);
    });
  }, []);

  useEffect(() => {
    const first = cart?.items[0]?.product;
    if (!first) return;
    api
      .calculateDelivery({ originState: first.originState, destinationState: state, size: first.size })
      .then(setDelivery)
      .catch(() => null);
  }, [cart, state]);

  const extra = Math.max(0, (cart?.items.length || 1) - 1) * 30;
  const deliveryFee = (delivery?.total || 0) + extra;
  const total = subtotal + deliveryFee;

  async function place(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await api.createOrder({
        buyerName: name,
        buyerState: state,
        buyerCity: city,
        guestId: guestId()
      });
      nav(`/order/${res.order.id}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("networkError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-3xl">{t("checkout")}</h1>
      <p className="mt-2 text-sm text-clay-600">{t("demoOrderNote")}</p>
      <form className="mt-6 grid gap-3" onSubmit={place}>
        <label>
          <span className="text-sm">{t("buyerName")}</span>
          <input className="input mt-1" required value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          <span className="text-sm">{t("location")}</span>
          <select className="input mt-1" value={state} onChange={(e) => setState(e.target.value)}>
            {INDIAN_STATES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-sm">{t("city")}</span>
          <input className="input mt-1" value={city} onChange={(e) => setCity(e.target.value)} />
        </label>
        <ul className="card text-sm">
          {(cart?.items || []).map((i) => (
            <li key={i.id} className="flex justify-between py-1">
              <span>
                {i.product.title} × {i.quantity}
              </span>
              <span>{formatInr(i.product.basePrice * i.quantity)}</span>
            </li>
          ))}
          <li className="mt-2 flex justify-between">
            <span>{t("subtotal")}</span>
            <span>{formatInr(subtotal)}</span>
          </li>
          <li className="flex justify-between">
            <span>{t("deliveryFee")}</span>
            <span>{formatInr(deliveryFee)}</span>
          </li>
          <li className="flex justify-between font-semibold">
            <span>{t("total")}</span>
            <span>{formatInr(total)}</span>
          </li>
        </ul>
        <ErrorBanner message={err} />
        <button className="btn-primary" type="submit" disabled={busy || !cart?.items.length}>
          {t("placeOrder")}
        </button>
      </form>
    </div>
  );
}
