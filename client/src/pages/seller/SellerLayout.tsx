import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SellerProvider } from "./SellerContext";

const STEPS = [
  { to: "/sell/photos", key: "photos" },
  { to: "/sell/voice", key: "voice" },
  { to: "/sell/description", key: "description" },
  { to: "/sell/price", key: "price" },
  { to: "/sell/promotion", key: "promotion" },
  { to: "/sell/publish", key: "publish" }
];

function Inner() {
  const { t } = useTranslation();
  const loc = useLocation();
  const nav = useNavigate();
  const idx = STEPS.findIndex((s) => loc.pathname.startsWith(s.to));

  return (
    <div className="mx-auto max-w-3xl">
      <button className="mb-4 text-sm text-clay-600" onClick={() => nav(idx > 0 ? STEPS[idx - 1].to : "/role")}>
        ← {t("back")}
      </button>
      <ol className="mb-6 flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <li
            key={s.key}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              i === idx ? "bg-clay-700 text-cream" : i < idx ? "bg-clay-200 text-clay-800" : "bg-clay-50 text-clay-500"
            }`}
          >
            {i + 1}. {t(`sellerSteps.${s.key}`)}
          </li>
        ))}
      </ol>
      <Outlet />
    </div>
  );
}

export function SellerLayout() {
  return (
    <SellerProvider>
      <Inner />
    </SellerProvider>
  );
}
