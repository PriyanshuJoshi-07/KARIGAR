import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { GeneratedDescription, ImageAnalysis, PromotionContent, DeliveryEstimate } from "../../services/api";

export interface DraftImage {
  url: string;
  file?: File;
  name: string;
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

const Ctx = createContext<{
  draft: SellerDraft;
  patch: (p: Partial<SellerDraft>) => void;
  reset: () => void;
} | null>(null);

export function SellerProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<SellerDraft>(empty);
  const value = useMemo(
    () => ({
      draft,
      patch: (p: Partial<SellerDraft>) => setDraft((d) => ({ ...d, ...p })),
      reset: () => setDraft(empty)
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
