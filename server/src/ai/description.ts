import { config } from "../utils/config.js";
import { extractDetailsFromTranscript } from "./extract.js";
import { suggestPrice } from "./pricing.js";

export interface GeneratedDescription {
  title: string;
  description: string;
  shortDescription: string;
  longDescription: string;
  story: string;
  category: string;
  categorySlug: string;
  craft: string;
  craftType: string;
  material: string;
  tags: string[];
  suggestedPrice: number;
  image?: string;
  features: string[];
  artisanStory: string;
  demo: boolean;
}

export async function generateDescription(input: {
  transcript?: string;
  productName?: string;
  material?: string;
  duration?: string;
  extra?: string;
  productType?: string;
  craft?: string;
  artisanName?: string;
  originCity?: string;
  originState?: string;
  imageUrl?: string;
  size?: string;
}): Promise<GeneratedDescription> {
  const extracted = extractDetailsFromTranscript(input.transcript || "");
  const name =
    (extracted.productName || input.productName || input.productType || "").replace(/\s+/g, " ").trim() ||
    "Handmade craft";
  const material = extracted.material || input.material || "locally sourced natural material";
  const durationText = extracted.duration || input.duration;
  const extraText = extracted.extra || input.extra;
  const craft = extracted.craft || input.craft || input.productType || "traditional craft";
  const artisan = input.artisanName || "the artisan";
  const place = [input.originCity, input.originState].filter(Boolean).join(", ") || "their village";
  const extra = extraText ? ` ${extraText}` : "";
  const duration = durationText ? ` It takes ${durationText} to make.` : "";
  const demo = config.demoMode || !process.env.OPENAI_API_KEY;

  const title = name;
  const shortDescription = `${title} made by hand from ${material}.`;
  const longDescription =
    `${title} is crafted from ${material} using ${craft}. ` +
    `Each piece is made by ${artisan} in ${place}.${duration}${extra} ` +
    `Slight variation in colour and form is expected and is a mark of the hand.`;
  const artisanStory = `${artisan} works from ${place}. This piece continues a family practice of ${craft}, using materials that can be sourced nearby.`;
  const features = [
    `Material: ${material}`,
    `Craft: ${craft}`,
    durationText ? `Time to make: ${durationText}` : "Made to order by hand",
    extraText || "One-of-a-kind variation"
  ].filter(Boolean) as string[];

  const price = suggestPrice({
    material,
    craft,
    categorySlug: extracted.categorySlug,
    duration: durationText,
    extra: extraText,
    size: input.size,
    productName: name
  });

  const tags = extracted.tags.length
    ? extracted.tags
    : [name, material, craft].map((v) => v.toLowerCase()).filter(Boolean);

  return {
    title,
    description: longDescription,
    shortDescription,
    longDescription,
    story: artisanStory,
    category: extracted.category || craft,
    categorySlug: extracted.categorySlug,
    craft,
    craftType: craft,
    material,
    tags,
    suggestedPrice: price.suggestedPrice,
    image: input.imageUrl || undefined,
    features,
    artisanStory,
    demo
  };
}
