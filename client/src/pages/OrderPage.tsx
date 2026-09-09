import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, formatInr, type Order } from "../services/api";
import { ErrorBanner } from "../components/ErrorBanner";

export function OrderPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [order, setOrder] = useState<Order | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .getOrder(id)
      .then((r) => setOrder(r.order))
      .catch((e) => setErr(e instanceof Error ? e.message : t("networkError")));
  }, [id, t]);

  if (err) return <ErrorBanner message={err} />;
  if (!order) return <p>…</p>;

  return (
    <div className="mx-auto max-w-xl card">
      <h1 className="font-display text-3xl">{t("orderConfirmed")}</h1>
      <p className="mt-2 text-sm text-clay-600">{t("thankYou")}</p>
      <p className="mt-4 font-mono text-sm">
        {t("orderId")}: {order.id}
      </p>
      <ul className="mt-4 text-sm">
        {order.items.map((i) => (
          <li key={i.id} className="flex justify-between py-1">
            <span>
              {i.title} × {i.quantity}
            </span>
            <span>{formatInr(i.unitPrice * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 font-semibold">
        {t("total")}: {formatInr(order.total)}
      </p>
      {order.items[0] && (
        <Link className="btn-secondary mt-6 inline-flex" to={`/product/${order.items[0].productId}`}>
          {t("writeReview")}
        </Link>
      )}
    </div>
  );
}
