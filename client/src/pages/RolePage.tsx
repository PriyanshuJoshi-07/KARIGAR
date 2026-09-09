import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { setRole } from "../utils/session";

export function RolePage() {
  const { t } = useTranslation();
  const nav = useNavigate();

  return (
    <div className="mx-auto max-w-3xl">
      <button className="mb-4 text-sm text-clay-600" onClick={() => nav("/")}>
        ← {t("back")}
      </button>
      <h1 className="font-display text-4xl">{t("whoAreYou")}</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <button
          className="card text-left hover:shadow-lift"
          type="button"
          onClick={() => {
            setRole("BUYER");
            nav("/market");
          }}
        >
          <h2 className="font-display text-2xl">{t("buyer")}</h2>
          <p className="mt-2 text-clay-600">{t("buyerHint")}</p>
        </button>
        <button
          className="card text-left hover:shadow-lift"
          type="button"
          onClick={() => {
            setRole("SELLER");
            nav("/sell/photos");
          }}
        >
          <h2 className="font-display text-2xl">{t("seller")}</h2>
          <p className="mt-2 text-clay-600">{t("sellerHint")}</p>
        </button>
      </div>
    </div>
  );
}
