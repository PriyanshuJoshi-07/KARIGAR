import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { resetSession } from "../utils/session";

export function AppLayout() {
  const { t } = useTranslation();
  const loc = useLocation();
  const nav = useNavigate();
  const buyerChrome = loc.pathname.startsWith("/market") || loc.pathname.startsWith("/product") || loc.pathname.startsWith("/cart") || loc.pathname.startsWith("/checkout") || loc.pathname.startsWith("/order");

  return (
    <div className="motif min-h-screen">
      <header className="sticky top-0 z-20 border-b border-clay-100 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to={buyerChrome ? "/market" : "/"} className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-clay-700 font-display text-lg text-cream">K</span>
            <span>
              <span className="block font-display text-lg leading-none">{t("appName")}</span>
              <span className="text-xs text-clay-600">{t("tagline")}</span>
            </span>
          </Link>
          {buyerChrome && (
            <nav className="flex items-center gap-3 text-sm font-medium">
              <Link to="/market" className="hidden sm:inline text-clay-800 hover:text-clay-600">
                {t("home")}
              </Link>
              <Link to="/cart" className="rounded-full bg-clay-100 px-3 py-1 text-clay-800">
                {t("cart")}
              </Link>
            </nav>
          )}
          <button
            className="text-sm text-clay-600 hover:text-clay-800"
            onClick={() => {
              resetSession();
              nav("/");
            }}
          >
            {t("logout")}
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
