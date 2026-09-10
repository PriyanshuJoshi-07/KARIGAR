import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { GeneratedDescription, ImageAnalysis, PromotionContent, DeliveryEstimate } from "../../services/api";

export interface DraftImage {
  url: string;
  previewUrl: string;
  persistentUrl?: string;
  file?: File;
  name: string;
  previewUrl?: string;
}

export interface SellerDraft {
  images: DraftImage[];
  analysis: ImageAnalysis | null;
  enhanced: Record<string, string>;
  chosenUrls: string[];
  productName: string;
  material: string;
  duration: string;
  extra: string;
  transcript: string;
  artisanName: string;
  originState: string;
  originCity: string;
  description: GeneratedDescription | null;
  basePrice: number | null;
  size: string;
  destinationState: string;
  delivery: DeliveryEstimate | null;
  promotion: PromotionContent | null;
  publishedId: string | null;
}

const empty: SellerDraft = {
  images: [],
  analysis: null,
  enhanced: {},
  chosenUrls: [],
  productName: "",
  material: "",
  duration: "",
  extra: "",
  transcript: "",
  artisanName: "",
  originState: "Assam",
  originCity: "",
  description: null,
  basePrice: null,
  size: "medium",
  destinationState: "Maharashtra",
  delivery: null,
  promotion: null,
  publishedId: null
};

const STORAGE_KEY = "karigar.sellerDraft";

function readStoredDraft(): SellerDraft {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<SellerDraft>;
    return {
      ...empty,
      ...parsed,
      images: Array.isArray(parsed.images) ? parsed.images.map((img) => ({ url: String(img?.url || ""), name: String(img?.name || ""), file: undefined })) : [],
      chosenUrls: Array.isArray(parsed.chosenUrls) ? parsed.chosenUrls.map(String).filter(Boolean) : [],
      enhanced: parsed.enhanced && typeof parsed.enhanced === "object" ? parsed.enhanced as Record<string, string> : {},
      description: parsed.description ?? null,
      delivery: parsed.delivery ?? null,
      promotion: parsed.promotion ?? null,
      analysis: parsed.analysis ?? null,
      publishedId: parsed.publishedId ?? null
    };
  } catch {
    return empty;
  }
}

const Ctx = createContext<{
  draft: SellerDraft;
  patch: (p: Partial<SellerDraft>) => void;
  reset: () => void;
} | null>(null);

export function SellerProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<SellerDraft>(() => readStoredDraft());

  useEffect(() => {
    try {
      const safe = {
        ...draft,
        images: draft.images.map(({ url, name }) => ({ url, name })),
        file: undefined,
        previewUrl: undefined,
        chosenUrls: draft.chosenUrls.filter((url) => !url.startsWith("blob:"))
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
    } catch {
      // Ignore storage write issues in demo mode.
    }
  }, [draft]);

  const value = useMemo(
    () => ({
      draft,
      patch: (p: Partial<SellerDraft>) => setDraft((d) => ({ ...d, ...p })),
      reset: () => {
        localStorage.removeItem(STORAGE_KEY);
        setDraft(empty);
      }
    }),
    [draft]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSeller() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSeller must be inside SellerProvider");
  return ctx;
}
