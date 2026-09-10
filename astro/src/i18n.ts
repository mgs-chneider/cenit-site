// Maps a page's path to its equivalent in the other language.
// Most pages mirror 1:1 under /en/; the two legal pages use different
// slugs in each language (Impressum/Datenschutz vs. Legal Notice/Privacy).
const DE_TO_EN: Record<string, string> = {
  "/impressum/": "/en/legal-notice/",
  "/datenschutz/": "/en/privacy/",
};
const EN_TO_DE: Record<string, string> = {
  "/en/legal-notice/": "/impressum/",
  "/en/privacy/": "/datenschutz/",
};

export type Locale = "de" | "en";

export function getLocale(pathname: string): Locale {
  return pathname.startsWith("/en/") || pathname === "/en" ? "en" : "de";
}

/** The same page's URL in the other language. */
export function getAltPath(pathname: string): string {
  if (pathname.startsWith("/en/") || pathname === "/en") {
    if (EN_TO_DE[pathname]) return EN_TO_DE[pathname];
    const rest = pathname.slice(3);
    return rest || "/";
  }
  if (DE_TO_EN[pathname]) return DE_TO_EN[pathname];
  return "/en" + pathname;
}

/** Prefix an internal DE-site link (e.g. "/faqs/") for the current locale. */
export function localize(path: string, locale: Locale): string {
  if (locale === "de") return path;
  if (path === "/") return "/en/";
  return "/en" + path;
}
