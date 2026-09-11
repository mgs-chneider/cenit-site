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

const radarEntry = z.object({
  kicker: bilingual,
  headline: bilingual,
  body: bilingual,
  citation: z.string().nullable().optional(),
  linkHref: z.string().url(),
  linkLabel: z.string(),
});

const radar = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/radar" }),
  schema: z.object({
    slug: z.string(),
    monthLabel: z.string(),
    title: bilingual,
    subtitle: bilingual,
    highlight: z
      .object({
        kicker: z.string(),
        title: bilingual,
        body: bilingual,
        linkHref: z.string().url(),
        linkLabel: bilingual,
      })
      .nullable(),
    szeneKontext: z.array(radarEntry),
    forschung: z.array(radarEntry),
    // Not every issue features a term - the feature started with the
    // July 2026 issue. When present, slug references the glossar
    // collection; teaser is this issue's own custom teaser copy (not
    // reused from the glossar entry's kurzdefinition).
    glossarBegriff: z
      .object({
        slug: z.string(),
        title: bilingual,
        teaser: bilingual,
      })
      .nullable(),
    kalender: z.array(
      z.object({
        day: z.string(),
        month: z.string(),
        name: z.string(),
        location: z.string(),
        linkHref: z.string().url(),
        linkLabel: z.string(),
      })
    ),
    indexTeaser: bilingual,
  }),
});

export const collections = { glossar, radar };
