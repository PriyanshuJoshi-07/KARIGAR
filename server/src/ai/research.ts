import { config } from "../utils/config.js";

export interface CraftResearch {
  craft: string;
  origin: string;
  history: string;
  techniques: string[];
  culturalNotes: string;
  demo: boolean;
}

const CRAFTS: Record<string, Omit<CraftResearch, "demo">> = {
  "bamboo weaving": {
    craft: "Bamboo weaving",
    origin: "Northeast India, especially Assam and Tripura",
    history:
      "Split bamboo and cane have been used for storage, fishing and market baskets for centuries in the Barak and Brahmaputra valleys.",
    techniques: ["splitting", "hexagonal weave", "cane binding"],
    culturalNotes: "Baskets are everyday tools, not museum objects. Durability is the measure of skill."
  },
  pottery: {
    craft: "Pottery",
    origin: "Khurja, Uttar Pradesh and many village kiln clusters",
    history: "Indian terracotta traditions predate written history. Wheel throwing remains the core skill.",
    techniques: ["wheel throwing", "slip", "wood firing"],
    culturalNotes: "Slight asymmetry is accepted. Perfectly round factory ware is a different object."
  },
  pattachitra: {
    craft: "Pattachitra",
    origin: "Raghurajpur, Odisha",
    history: "Cloth painting for temple and village narrative, using mineral and organic pigments.",
    techniques: ["cloth priming", "natural pigment grinding", "fine line work"],
    culturalNotes: "Stories of Jagannath and local life are painted within strict border conventions."
  },
  "wood turning": {
    craft: "Wood turning",
    origin: "Channapatna, Karnataka",
    history: "GI-tagged toy tradition using hale wood and lac dyes, associated with Persian-influenced turning.",
    techniques: ["lathe turning", "lac colouring", "vegetable dyes"],
    culturalNotes: "The toys are meant to be handled, including by children."
  },
  "metal engraving": {
    craft: "Metal engraving",
    origin: "Moradabad, Uttar Pradesh",
    history: "Moradabad is a long-standing brassware centre supplying lamps, trays and inlay work.",
    techniques: ["hammering", "piercing", "planishing"],
    culturalNotes: "Unlacquered brass darkens with use; that patina is part of the object."
  },
  "ajrakh block print": {
    craft: "Ajrakh block print",
    origin: "Kutch, Gujarat and Sindh",
    history: "Ajrakh is a resist-dye tradition using indigo, madder and carved teak blocks over many stages.",
    techniques: ["block carving", "resist printing", "indigo vatting"],
    culturalNotes: "Fourteen or more stages are common. Weather controls the calendar."
  }
};

export async function researchCraft(craft: string): Promise<CraftResearch> {
  const key = craft.toLowerCase();
  const found =
    CRAFTS[key] ||
    Object.values(CRAFTS).find((c) => key.includes(c.craft.toLowerCase()) || c.craft.toLowerCase().includes(key));
  const base = found ?? {
    craft,
    origin: "India",
    history: "A living handcraft practice passed within families and neighbourhood workshops.",
    techniques: ["hand forming", "natural materials"],
    culturalNotes: "Regional variation is the point. There is no single correct style."
  };
  return { ...base, demo: config.demoMode };
}
