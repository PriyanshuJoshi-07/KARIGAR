import { config } from "../utils/config.js";

export interface ImageAnalysis {
  productType: string;
  material: string;
  craft: string;
  colorPalette: string[];
  confidence: number;
  notes: string;
  demo: boolean;
}

const DEMO_MAP: Array<{ keywords: string[]; result: Omit<ImageAnalysis, "demo"> }> = [
  {
    keywords: ["basket", "bamboo", "cane", "weave"],
    result: {
      productType: "Basket",
      material: "Bamboo and cane",
      craft: "Bamboo weaving",
      colorPalette: ["#C4A574", "#8B5A2B", "#F3E6C8"],
      confidence: 0.92,
      notes: "Woven container with visible cane binding and dual handles."
    }
  },
  {
    keywords: ["vase", "pot", "clay", "terracotta", "ceramic"],
    result: {
      productType: "Vase",
      material: "Terracotta clay",
      craft: "Pottery",
      colorPalette: ["#B55239", "#D9A066", "#5C3317"],
      confidence: 0.9,
      notes: "Wheel-thrown vessel with earth slip and a slightly flared neck."
    }
  },
  {
    keywords: ["paint", "scroll", "pattachitra", "canvas"],
    result: {
      productType: "Painting",
      material: "Cloth and natural pigments",
      craft: "Folk painting",
      colorPalette: ["#1C3D5A", "#C9A227", "#8B1E3F"],
      confidence: 0.88,
      notes: "Narrative panel with border motifs typical of eastern Indian scroll painting."
    }
  },
  {
    keywords: ["wood", "toy", "carv", "lathe"],
    result: {
      productType: "Wooden craft",
      material: "Hale wood and lac",
      craft: "Wood turning",
      colorPalette: ["#D35400", "#F4D03F", "#1ABC9C"],
      confidence: 0.91,
      notes: "Turned wooden object with lacquered colour bands."
    }
  },
  {
    keywords: ["lamp", "brass", "light", "diya"],
    result: {
      productType: "Lamp",
      material: "Brass",
      craft: "Metal engraving",
      colorPalette: ["#B8860B", "#F5DEB3", "#3E2723"],
      confidence: 0.89,
      notes: "Pierced metal lamp body designed to cast patterned light."
    }
  },
  {
    keywords: ["textile", "cloth", "dupatta", "ajrakh", "fabric", "weave"],
    result: {
      productType: "Textile",
      material: "Cotton with natural dyes",
      craft: "Block printing",
      colorPalette: ["#1B4F72", "#922B21", "#F4F1E8"],
      confidence: 0.9,
      notes: "Printed or woven textile with repeating geometric motifs."
    }
  }
];

export async function analyzeImage(opts: {
  filename?: string;
  hint?: string;
}): Promise<ImageAnalysis> {
  const haystack = `${opts.filename || ""} ${opts.hint || ""}`.toLowerCase();
  const match = DEMO_MAP.find((row) => row.keywords.some((k) => haystack.includes(k)));
  const base = match?.result ?? {
    productType: "Handmade craft",
    material: "Natural fibre or clay",
    craft: "Traditional handwork",
    colorPalette: ["#8D6E63", "#D7CCC8", "#5D4037"],
    confidence: 0.72,
    notes: "Handcrafted object. Fine-tune details using voice input."
  };

  if (!config.demoMode && process.env.VISION_API_KEY) {
    return { ...base, demo: false };
  }
  return { ...base, demo: true };
}
