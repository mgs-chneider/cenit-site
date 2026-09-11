import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const bilingual = z.object({
  de: z.string(),
  en: z.string(),
});

const weiterfuehrendLink = z.union([
  z.object({
    type: z.literal("internal"),
    slug: z.string(),
  }),
  z.object({
    type: z.literal("external"),
    href: z.string().url(),
    label: bilingual,
  }),
]);

const glossar = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/glossar" }),
  schema: z.object({
    slug: z.string(),
    category: z.enum([
      "grundlagen",
      "verletzung-praevention",
      "physiologie-gesundheit",
      "psychische-gesundheit",
      "anatomie-technik",
    ]),
    title: bilingual,
    subtitle: bilingual,
    teaser: bilingual,
    kurzdefinition: bilingual,
    imTanzkontext: bilingual,
    warumWichtig: bilingual,
    hinweis: bilingual,
    quellen: bilingual,
    weiterfuehrend: z.array(weiterfuehrendLink),
    metaDescriptionDe: z.string(),
    // Set once a term has been featured as the monthly Glossar-Begriff in
    // the CENIT Radar teaser + the LinkedIn "Dance Teaching, Coaching and
    // Training" group post (same term, both channels, tracked once here
    // rather than separately per channel). Format: "YYYY-MM".
    linkedinFeatured: z.string().optional(),
  }),
});

export const collections = { glossar };
