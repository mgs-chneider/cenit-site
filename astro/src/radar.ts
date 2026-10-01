import { getCollection } from "astro:content";

// Slugs are "radar-<german-month-name>-<year>" - sort chronologically by
// year+month, not alphabetically (alphabetical would put "august" before
// "juni" before "juli" before "september", which isn't calendar order).
const GERMAN_MONTHS = [
  "januar", "februar", "maerz", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "dezember",
];

export function radarSortKey(slug: string) {
  const match = slug.match(/^radar-([a-z]+)-(\d{4})$/);
  if (!match) return 0;
  const [, monthName, year] = match;
  const monthIndex = GERMAN_MONTHS.indexOf(monthName);
  return Number(year) * 12 + monthIndex;
}

/** All Radar issues, newest first. */
export async function getRadarIssues() {
  return (await getCollection("radar")).sort(
    (a, b) => radarSortKey(b.data.slug) - radarSortKey(a.data.slug)
  );
}

/** The newest Radar issue (drives the side drawer and the menu link). */
export async function getLatestRadar() {
  const [latest] = await getRadarIssues();
  return latest;
}
