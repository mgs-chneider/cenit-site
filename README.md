# CENIT e.V. — Website

Quellcode der offiziellen Website von **CENIT – Verein zur Förderung interdisziplinärer Tanzmedizin e.V.**

🔗 [cenit-ev.de](https://cenit-ev.de)

## Über CENIT e.V.

CENIT ist ein gemeinnütziger Verein, der sich für die gesundheitliche Prävention im Tanz einsetzt — durch Wissensvermittlung, Vernetzung von Wissenschaft und Praxis sowie die Unterstützung tanzmedizinischer Forschung. Mehr dazu unter [Satzung & Leitbild](https://cenit-ev.de/satzung).

## Tech-Stack

- [Astro](https://astro.build) (statischer Output, `output: "static"`), kein UI-Framework nötig
- Mehrsprachigkeit (DE/EN) über echtes Astro-i18n-Routing (`/en/...`-Präfix, `de` als Default ohne Präfix) statt clientseitiger Umschaltung
- Content Collections (Astro Content Layer API) für Glossar und CENIT Radar — Einträge als typisierte JSON-Dateien statt Copy-Paste-HTML
- Deployment über [Vercel](https://vercel.com), Root Directory `astro/`, automatischer Build bei jedem Push auf `main`
- Eigenes, leichtgewichtiges Cookie-Consent-Script (`astro/public/assets/js/consent.js`, keine externe Abhängigkeit): gated Google Analytics und die Infogram-Grafiken auf `/zahlen-fakten/` hinter aktiver Einwilligung gemäß § 25 TDDDG / Art. 6(1)(a) DSGVO

## Projektstruktur

Der komplette Quellcode liegt unter `astro/`:

```
astro/
  src/
    pages/          Astro-Seiten (Ordner = Route, index.astro = Einstiegspunkt), englische Varianten unter pages/en/
    layouts/        Layout.astro — zentrale Seiten-Hülle (Meta-Tags, hreflang, hreflang-Alternates)
    components/     Header.astro, Footer.astro und weitere wiederverwendbare Bausteine
    content/        glossar/*.json, radar/*.json — Inhalte der Content Collections
    content.config.ts   Zod-Schemas für die Content Collections
    i18n.ts         Locale-Erkennung und DE↔EN-Pfad-Zuordnung
  public/           Statische Dateien (Bilder, Fonts, CSS, JS, Videos), unverändert ausgeliefert
  astro.config.mjs  Astro-Konfiguration inkl. i18n-Setup
  vercel.json       Redirects für Vercel (Root Directory dieses Projekts)
```

### Routing-Konvention

Jede Seite liegt in einem eigenen Ordner mit einer `index.astro` darin (z. B. `astro/src/pages/satzung/index.astro` → `/satzung/`). Die englische Version derselben Seite liegt unter `astro/src/pages/en/...` mit demselben Muster.

## Content-Konventionen

### Glossar

Unter `/glossar/` liegt ein zweisprachiges Fachbegriff-Glossar zur Tanzmedizin, aktuell 24 Begriffe in fünf Kategorien: Grundlagen, Verletzung & Prävention, Physiologie & Gesundheit, Psychische Gesundheit, Anatomie & Technik.

Jeder Begriff ist eine JSON-Datei unter `astro/src/content/glossar/[begriff].json` (Schema in `astro/src/content.config.ts`) und folgt einer festen sechsteiligen Struktur: Kurzdefinition, Im Tanzkontext, Warum das für Prävention wichtig ist, Hinweis, Quellen, Weiterführend. Inhalte sind reine Wissensvermittlung im Präventionskontext — keine Diagnosen oder Behandlungsempfehlungen, Sprache durchgängig gehedgt ("kann ein Hinweis sein auf …" statt "bedeutet …"). Quellen sind peer-reviewed oder stammen von anerkannten Fachorganisationen (IADMS, ta.med) und werden mit DOI oder Direktlink zitiert. Die Detailseiten (DE unter `/glossar/[slug]/`, EN unter `/en/glossar/[slug]/`) werden per `getStaticPaths()` aus der Collection generiert (`astro/src/pages/glossar/[slug]/index.astro` und das `en/`-Gegenstück).

Die Übersichtsseite (`astro/src/pages/glossar/index.astro`) gruppiert die Begriffe in Kategorie-Karten (Kartenstil analog zur FAQ-Seite: weißer Außenrahmen, farbige/helle Innenkarten alternierend). Die Kategorie „Grundlagen" (Tanzmedizin, Interdisziplinäre Versorgung, Screening) steht als Einführung voran, volle Breite, drei Spalten mit Teaser-Text statt Linkliste. Begriffe innerhalb der übrigen Kategorien sind alphabetisch sortiert (Reihenfolge in `astro/src/glossar-categories.ts`).

### CENIT Radar

Unter `/einblicke-entwicklungen/radar-[monat]-[jahr]/` erscheint monatlich ein kuratierter Newsletter mit aktuellen Entwicklungen aus Forschung, Szene und Veranstaltungen der Tanzmedizin (Rubriken: Veranstaltung des Monats, Szene & Kontext, Forschung, Glossar-Begriff des Monats, Im Kalender). Jede Ausgabe ist eine JSON-Datei unter `astro/src/content/radar/radar-[monat]-[jahr].json` (Schema ebenfalls in `astro/src/content.config.ts`); die Detailseiten werden analog zum Glossar per `getStaticPaths()` generiert. Der Glossar-Begriff des Monats stellt einen noch nicht vorgestellten Eintrag im Glossar als Teaser vor und verlinkt auf die vollständige Glossar-Seite, um die Verweildauer zu erhöhen.

### LinkedIn-Begriff des Monats

Zusätzlich zum Teaser im CENIT Radar wird derselbe monatliche Glossar-Begriff direkt an die rund 19.000 Mitglieder der LinkedIn-Gruppe „Dance Teaching, Coaching and Training" herangetragen. Welcher Begriff bereits verwendet wurde, wird dokumentiert, um Wiederholungen in beiden Kanälen zu vermeiden.

### Förderaufrufe

Unter `/foerderaufrufe/` steht eine kuratierte, laufend aktualisierte Übersicht öffentlich zugänglicher EU-Förderprogramme (Horizon Europe, Erasmus+ Sport, COST u. a.) mit Relevanz für tanzmedizinische Forschung. Gegliedert in „Aktuell offen" und „Im Blick behalten" (Calls, deren nächste Runde noch nicht veröffentlicht ist). CENIT tritt hier nicht als Antragsteller auf, sondern als Orientierungshilfe für Hochschulen und Fachverbände im eigenen Netzwerk. Der Disclaimer nennt ausschließlich die tatsächlich zuständigen EU-Stellen je Programm (COST Association, REA, EACEA) — die Zuordnung wird bei jeder Aktualisierung geprüft, nicht pauschal übernommen.

### Zahlen & Fakten

Unter `/zahlen-fakten/` liegt die evidenzbasierte Beleg-Seite der Website, mit zwei redaktionell getrennten Kapiteln: Verletzungsprävalenz/-häufigkeit im Tanz (Infogram-Grafiken, Anker `#verletzungen` implizit über die Chart-Sektion) und „Prävention rechnet sich" für Kostenträger (`#kostentraeger`, ökonomische Evidenz plus Praxisbeispiele wie die VBG-Tanzpräventionsinitiative). Die Seite ist im Hauptmenü verlinkt und wird zusätzlich auf der Startseite in einer Teaser-Sektion zwischen Hero und Vision & Mission zusammengefasst (Problemseite: Verletzungszahlen als Auslöser für die Vision; die Kostenträger-Ökonomie bleibt bewusst exklusiv auf der Unterseite). Die Infogram-Charts laden erst nach Einwilligung über das eigene Consent-Script (siehe Tech-Stack); bei bereits erteilter Einwilligung laden sie beim Seitenaufruf automatisch nach.

### Rechtliches

Bilinguale rechtliche Hinweise liegen unter `astro/src/pages/impressum/` (DE, ohne Sprachpräfix) und `astro/src/pages/en/legal-notice/` (EN) — die Slugs unterscheiden sich bewusst zwischen den Sprachen; die DE↔EN-Zuordnung dafür steht in `astro/src/i18n.ts`. Dazu Anker-IDs für die Abschnitte Haftung für Links (`#haftung-fuer-links` / `#liability-for-links`) und Urheberrecht (`#urheberrecht` / `#copyright`). Glossar-Einträge mit externen Quellenverweisen verlinken auf diese Abschnitte.

Datenschutzerklärung/Privacy Policy liegen unter `astro/src/pages/datenschutz/` (DE) und `astro/src/pages/en/privacy/` (EN) und dokumentieren Google Analytics sowie die Infogram-Einbindung auf Consent-Basis (eigenes Consent-Script, siehe Tech-Stack). Diese Seiten nutzen wie alle anderen das gemeinsame `Layout.astro` inkl. Header/Footer.

### UI-Konventionen

Externe Link-Buttons und Inline-Links verwenden statt des Unicode-Zeichens „↗" ein inline-SVG (`.cenit-arrow-icon`, `currentColor`-Stroke), da „↗" auf iOS/mobilen Geräten als großes, kastenförmiges Farb-Emoji dargestellt wird. Ausnahme: auf den CENIT-Radar-Seiten (`/einblicke-entwicklungen/radar-*/`) werden Link-Buttons bewusst ganz ohne Pfeil-Symbol gesetzt (weder Unicode noch SVG), auf Wunsch schlankerer Optik bei vielen Links pro Ausgabe.

## Lokale Entwicklung

```bash
cd astro
npm install
npm run dev
```

## Build

```bash
cd astro
npm run build
```

Erzeugt das vollständige, statische Website-Verzeichnis unter `astro/dist/`. Vercel führt diesen Schritt automatisch bei jedem Deployment aus.

## Deployment

Jeder Push auf den `main`-Branch löst automatisch einen neuen Build und Deployment auf Vercel aus (Root Directory des Vercel-Projekts: `astro/`). Es ist kein manueller Deployment-Schritt erforderlich.

## Lizenz & Kontakt

© CENIT – Verein zur Förderung interdisziplinärer Tanzmedizin e.V.
Bei Fragen: [info@cenit-ev.de](mailto:info@cenit-ev.de)
