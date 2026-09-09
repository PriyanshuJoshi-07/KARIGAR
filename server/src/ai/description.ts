import { config } from "../utils/config.js";

export interface GeneratedDescription {
  title: string;
  shortDescription: string;
  longDescription: string;
  material: string;
  craft: string;
  features: string[];
  artisanStory: string;
  demo: boolean;
}

export async function generateDescription(input: {
  productName?: string;
  material?: string;
  duration?: string;
  extra?: string;
  productType?: string;
  craft?: string;
  artisanName?: string;
  originCity?: string;
  originState?: string;
}): Promise<GeneratedDescription> {
  const name = input.productName || input.productType || "Handmade craft";
  const material = input.material || "locally sourced natural material";
  const craft = input.craft || input.productType || "traditional craft";
  const artisan = input.artisanName || "the artisan";
  const place = [input.originCity, input.originState].filter(Boolean).join(", ") || "their village";
  const extra = input.extra ? ` ${input.extra}` : "";
  const duration = input.duration ? ` Making time: ${input.duration}.` : "";

  const title = `${name}`.replace(/\s+/g, " ").trim();
  const shortDescription = `${title} in ${material}, made by hand using ${craft}.`;
  const longDescription = `${title} is crafted from ${material} using ${craft}. Each piece is made by ${artisan} in ${place}.${duration}${extra} Slight variation in colour and form is expected and is a mark of the hand.`;
  const artisanStory = `${artisan} works from ${place}. This piece continues a family practice of ${craft}, using materials that can be sourced nearby.`;
  const features = [
    `Material: ${material}`,
    `Craft: ${craft}`,
    duration ? `Time to make: ${input.duration}` : "Made to order by hand",
    "One-of-a-kind variation"
  ].filter(Boolean) as string[];

  return {
    title,
    shortDescription,
    longDescription,
    material,
    craft,
    features,
    artisanStory,
    demo: config.demoMode || !process.env.OPENAI_API_KEY
  };
}
