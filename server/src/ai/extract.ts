export interface ExtractedDetails {
  productName: string;
  material: string;
  duration: string;
  extra: string;
  category: string;
  categorySlug: string;
  craft: string;
  tags: string[];
}

const WORD_NUMBERS: Record<string, string> = {
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
  ten: "10",
  eleven: "11",
  twelve: "12"
};

const MATERIAL_WORDS = [
  "clay and sand",
  "clay",
  "sand",
  "terracotta",
  "ceramic",
  "bamboo",
  "cane",
  "wood",
  "wooden",
  "brass",
  "metal",
  "cotton",
  "silk",
  "wool",
  "fabric",
  "cloth",
  "leather",
  "jute",
  "grass",
  "stone",
  "glass",
  "lac",
  "indigo",
  "madder"
];

const PRODUCT_HINTS: Array<{
  keywords: string[];
  nameHint?: string;
  category: string;
  categorySlug: string;
  craft: string;
  material?: string;
}> = [
  {
    keywords: ["flower pot", "flowerpot", "pot", "vase", "pottery", "terracotta"],
    nameHint: "flower pot",
    category: "Pottery",
    categorySlug: "pottery",
    craft: "Pottery",
    material: "clay"
  },
  {
    keywords: ["basket", "weaving", "woven"],
    nameHint: "basket",
    category: "Baskets",
    categorySlug: "baskets",
    craft: "Weaving"
  },
  {
    keywords: ["painting", "scroll", "pattachitra", "canvas"],
    category: "Paintings",
    categorySlug: "paintings",
    craft: "Folk painting"
  },
  {
    keywords: ["wood", "wooden", "carving", "toy"],
    category: "Woodwork",
    categorySlug: "wood",
    craft: "Woodwork"
  },
  {
    keywords: ["lamp", "diya", "brass"],
    category: "Lamps",
    categorySlug: "lamps",
    craft: "Metalwork"
  },
  {
    keywords: ["textile", "dupatta", "fabric", "cloth", "saree", "shawl"],
    category: "Textiles",
    categorySlug: "textiles",
    craft: "Textiles"
  },
  {
    keywords: ["jewellery", "jewelry", "necklace", "earring", "bangle"],
    category: "Jewellery",
    categorySlug: "jewellery",
    craft: "Jewellery"
  }
];

function tidy(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/^[\s,.;:-]+|[\s,.;:-]+$/g, "")
    .trim();
}

function capitalizeName(value: string): string {
  const cleaned = tidy(value);
  if (!cleaned) return "";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function firstMatch(text: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return tidy(match[1]);
  }
  return "";
}

function extractProductName(text: string): string {
  const spoken = firstMatch(text, [
    /\bthis is (?:a |an |the )?(.+?)(?:,|\.| made of| made from| made with| made by| it is| it takes| that is|$)/i,
    /\bi (?:made|make|am making|have made) (?:a |an |the )?(.+?)(?:,|\.| made of| made from| made with| made by| it is| it takes|$)/i,
    /\b(?:called|named) (?:a |an |the )?(.+?)(?:,|\.|$)/i
  ]);
  if (spoken) {
    return capitalizeName(
      spoken
        .replace(/\bmade by hand\b/gi, "")
        .replace(/\bhandmade\b/gi, "")
        .replace(/\bhand made\b/gi, "")
    );
  }

  const hint = PRODUCT_HINTS.find((row) => row.keywords.some((k) => text.includes(k)));
  if (hint?.nameHint && text.includes(hint.nameHint)) return capitalizeName(hint.nameHint);
  if (hint?.keywords[0]) {
    const found = hint.keywords.find((k) => text.includes(k));
    if (found) return capitalizeName(found);
  }
  return "";
}

function extractMaterial(text: string, productName: string): string {
  const spoken = firstMatch(text, [
    /\bmade (?:of|from|with) (.+?)(?:,|\.| it takes| it is| and is | and it | to make|$)/i,
    /\bmaterial(?: is|:)? (.+?)(?:,|\.|$)/i,
    /\busing (.+?)(?:,|\.| to make| it takes|$)/i
  ]);
  if (spoken) {
    return tidy(
      spoken
        .replace(/\bmade by hand\b/gi, "")
        .replace(/\bby hand\b/gi, "")
        .replace(/\bhand\b/gi, "")
    );
  }

  const fromName = MATERIAL_WORDS.filter((word) => productName.toLowerCase().includes(word));
  if (fromName.length) return fromName[0];

  const fromText = MATERIAL_WORDS.filter((word) => text.includes(word) && word !== "hand");
  if (fromText.length) return fromText[0];
  return "";
}

function extractDuration(text: string): string {
  const spoken = firstMatch(text, [
    /\btakes? (?:about |around |approximately )?(.+?) to make/i,
    /\bit takes? (?:about |around |approximately )?(.+?)(?:\.|,|$)/i,
    /\b(?:time to make|making time|took)(?: is|:)? (.+?)(?:\.|,|$)/i
  ]);
  if (spoken) {
    const compact = spoken
      .replace(/\babout\b/gi, "")
      .replace(/\baround\b/gi, "")
      .replace(/\bapproximately\b/gi, "");
    return tidy(compact);
  }
  const unit = text.match(
    /\b((?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+)\s+(?:days?|weeks?|months?|hours?))\b/i
  );
  return unit?.[1] ? tidy(unit[1]) : "";
}

function extractExtra(text: string, used: string[]): string {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => tidy(s))
    .filter(Boolean);
  const leftover = sentences.filter((sentence) => {
    const lower = sentence.toLowerCase();
    if (/^this is\b/.test(lower)) return false;
    if (/\bmade (?:of|from|with)\b/.test(lower) && !/\b(?:useful|strong|storage|durable)\b/.test(lower)) return false;
    if ((/\btakes?\b.+\bto make\b/.test(lower) || /\bit takes\b/.test(lower)) && !/\b(?:useful|storage|strong)\b/.test(lower)) {
      return false;
    }
    return !used.some((part) => part && lower.includes(part.toLowerCase()) && sentence.length < part.length + 12);
  });
  if (leftover.length) {
    const extras = leftover
      .map((sentence) => {
        const useful = sentence.match(/\b(?:it is|and is|useful for|used for|good for)\s+(.+)$/i);
        if (useful?.[1] && /takes?.+to make/i.test(sentence)) {
          const rest = tidy(useful[1]);
          return rest.startsWith("useful") || rest.startsWith("used") || rest.startsWith("good") ? rest : `It is ${rest}`;
        }
        return sentence;
      })
      .filter(Boolean);
    return extras.join(" ");
  }

  const useful = firstMatch(text, [/\b(?:it is|and is|useful for|used for|good for) (.+)$/i]);
  return useful
    ? tidy(useful.startsWith("useful") || useful.startsWith("used") || useful.startsWith("good") ? useful : `It is ${useful}`)
    : "";
}

function classify(text: string, productName: string, material: string) {
  const haystack = `${productName} ${material} ${text}`.toLowerCase();
  const match = PRODUCT_HINTS.find((row) => row.keywords.some((k) => haystack.includes(k)));
  return (
    match || {
      category: "Handmade",
      categorySlug: "baskets",
      craft: "Traditional handwork"
    }
  );
}

export function extractDetailsFromTranscript(raw: string): ExtractedDetails {
  const text = tidy(raw).toLowerCase();
  const original = tidy(raw);
  if (!original) {
    return {
      productName: "",
      material: "",
      duration: "",
      extra: "",
      category: "Handmade",
      categorySlug: "baskets",
      craft: "Traditional handwork",
      tags: []
    };
  }

  const productName = extractProductName(text);
  const material = extractMaterial(text, productName);
  const duration = extractDuration(text);
  const extra = extractExtra(original, [productName, material, duration]);
  const classified = classify(text, productName, material);

  const tags = Array.from(
    new Set(
      [productName, material, classified.craft, classified.category, duration]
        .flatMap((value) => value.split(/[,&]/))
        .map((value) => tidy(value).toLowerCase())
        .filter((value) => value.length > 1)
    )
  ).slice(0, 8);

  return {
    productName,
    material,
    duration,
    extra,
    category: classified.category,
    categorySlug: classified.categorySlug,
    craft: classified.craft,
    tags
  };
}

export function durationDays(duration: string): number {
  const lower = duration.toLowerCase();
  const numberMatch = lower.match(/(\d+)/);
  let amount = numberMatch ? Number(numberMatch[1]) : 0;
  if (!amount) {
    const word = Object.keys(WORD_NUMBERS).find((w) => lower.includes(w));
    amount = word ? Number(WORD_NUMBERS[word]) : 0;
  }
  if (/week/.test(lower)) return amount * 7;
  if (/month/.test(lower)) return amount * 30;
  if (/hour/.test(lower)) return Math.max(1, Math.round(amount / 8));
  return amount;
}
