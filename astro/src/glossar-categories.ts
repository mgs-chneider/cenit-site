export const CATEGORY_ORDER = [
  "grundlagen",
  "verletzung-praevention",
  "physiologie-gesundheit",
  "psychische-gesundheit",
  "anatomie-technik",
] as const;

export type CategoryKey = (typeof CATEGORY_ORDER)[number];

export const CATEGORY_LABELS: Record<CategoryKey, { de: string; en: string }> = {
  grundlagen: { de: "Grundlagen", en: "Fundamentals" },
  "verletzung-praevention": { de: "Verletzung & Prävention", en: "Injury & Prevention" },
  "physiologie-gesundheit": { de: "Physiologie & Gesundheit", en: "Physiology & Health" },
  "psychische-gesundheit": { de: "Psychische Gesundheit", en: "Mental Health" },
  "anatomie-technik": { de: "Anatomie & Technik", en: "Anatomy & Technique" },
};
