import { config } from "../utils/config.js";
import { durationDays } from "./extract.js";

export interface DeliveryEstimate {
  originState: string;
  destinationState: string;
  size: string;
  baseFee: number;
  distanceFee: number;
  sizeFee: number;
  total: number;
  etaDays: number;
  demo: boolean;
}

const REGION: Record<string, string> = {
  "Andhra Pradesh": "south",
  Telangana: "south",
  Karnataka: "south",
  Kerala: "south",
  "Tamil Nadu": "south",
  Maharashtra: "west",
  Gujarat: "west",
  Goa: "west",
  Rajasthan: "west",
  "Madhya Pradesh": "central",
  Chhattisgarh: "central",
  Delhi: "north",
  Haryana: "north",
  Punjab: "north",
  "Himachal Pradesh": "north",
  Uttarakhand: "north",
  "Uttar Pradesh": "north",
  Bihar: "east",
  Jharkhand: "east",
  Odisha: "east",
  "West Bengal": "east",
  Assam: "northeast"
};

const SIZE_FEE: Record<string, number> = { small: 40, medium: 70, large: 120 };

export function calculateDelivery(input: {
  originState: string;
  destinationState: string;
  size?: string;
}): DeliveryEstimate {
  const size = (input.size || "medium").toLowerCase();
  const originRegion = REGION[input.originState] || "central";
  const destRegion = REGION[input.destinationState] || "central";
  const sameState = input.originState === input.destinationState;
  const sameRegion = originRegion === destRegion;
  const distanceFee = sameState ? 0 : sameRegion ? 60 : 140;
  const sizeFee = SIZE_FEE[size] ?? 70;
  const baseFee = 50;
  const total = baseFee + distanceFee + sizeFee;
  const etaDays = sameState ? 3 : sameRegion ? 5 : 8;
  return {
    originState: input.originState,
    destinationState: input.destinationState,
    size,
    baseFee,
    distanceFee,
    sizeFee,
    total,
    etaDays,
    demo: config.demoMode
  };
}

export interface PriceSuggestion {
  suggestedPrice: number;
  currency: string;
  rationale: string;
  demo: boolean;
}

const CATEGORY_BASE: Record<string, number> = {
  pottery: 700,
  baskets: 800,
  paintings: 1800,
  wood: 650,
  lamps: 1500,
  textiles: 1200,
  jewellery: 1400
};

export function suggestPrice(input: {
  material?: string;
  craft?: string;
  categorySlug?: string;
  duration?: string;
  extra?: string;
  size?: string;
  productName?: string;
}): PriceSuggestion {
  const haystack = `${input.categorySlug || ""} ${input.craft || ""} ${input.productName || ""}`.toLowerCase();
  const slug =
    input.categorySlug && CATEGORY_BASE[input.categorySlug]
      ? input.categorySlug
      : haystack.includes("potter") || haystack.includes("pot") || haystack.includes("vase")
        ? "pottery"
        : haystack.includes("basket") || haystack.includes("weav")
          ? "baskets"
          : haystack.includes("paint")
            ? "paintings"
            : haystack.includes("wood")
              ? "wood"
              : haystack.includes("lamp")
                ? "lamps"
                : haystack.includes("textile") || haystack.includes("cloth") || haystack.includes("fabric")
                  ? "textiles"
                  : haystack.includes("jewel")
                    ? "jewellery"
                    : "baskets";

  let price = CATEGORY_BASE[slug] ?? 750;
  const days = durationDays(input.duration || "");
  if (days) price += Math.min(800, days * 40);
  const mat = (input.material || "").toLowerCase();
  if (mat.includes("brass") || mat.includes("silk") || mat.includes("gold")) price += 300;
  if (mat.includes("clay") || mat.includes("bamboo") || mat.includes("sand")) price += 50;
  const size = (input.size || "medium").toLowerCase();
  if (size === "small") price -= 80;
  if (size === "large") price += 150;
  price = Math.max(150, Math.round(price / 10) * 10);

  const parts = [
    input.craft || "handmade craft",
    input.material ? `made from ${input.material}` : "",
    days ? `about ${input.duration} of work` : ""
  ].filter(Boolean);

  return {
    suggestedPrice: price,
    currency: "INR",
    rationale: `Suggested from ${parts.join(", ")}.`,
    demo: config.demoMode || !process.env.OPENAI_API_KEY
  };
}
