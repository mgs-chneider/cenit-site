# CENIT e.V. — Website

Quellcode der offiziellen Website von **CENIT – Verein zur Förderung interdisziplinärer Tanzmedizin e.V.**

🔗 [cenit-ev.de](https://cenit-ev.de)

## Über CENIT e.V.

CENIT ist ein gemeinnütziger Verein, der sich für die gesundheitliche Prävention im Tanz einsetzt — durch Wissensvermittlung, Vernetzung von Wissenschaft und Praxis sowie die Unterstützung tanzmedizinischer Forschung. Mehr dazu unter [Satzung & Leitbild](https://cenit-ev.de/satzung).

## Tech-Stack

- Statisches HTML/CSS, kein Frontend-Framework
- Eigenes, leichtgewichtiges Build-System (`build.mjs`) zur Zusammenführung von Seiten und Partials
- Deployment über [Vercel](https://vercel.com), automatischer Build bei jedem Push auf `main`
- Mehrsprachigkeit (DE/EN) über clientseitige Sprachumschaltung (`data-lang` Attribute), nicht über getrennte Routen

## Projektstruktur

```
src/
  pages/          Einzelne Seiten als HTML-Dateien (Ordner = Route, index.html = Einstiegspunkt)
  partials/       Wiederverwendbare Bausteine (Header, Footer, Favicon-Links)
  assets/         Bilder, Fonts, CSS, JS
public/           Statische Dateien, die unverändert ins Root-Verzeichnis kopiert werden
dist/             Build-Output (wird bei jedem Build neu erzeugt, nicht versioniert)
build.mjs         Build-Skript: führt Partials in Seiten ein, kopiert Assets nach dist/
vercel.json       Vercel-Konfiguration (Rewrites, Routing)
```

### Routing-Konvention

Jede Seite liegt in einem eigenen Ordner mit einer `index.html` darin (z. B. `src/pages/satzung/index.html` → `/satzung/`). Das stellt sicher, dass Routen sowohl im Build-System als auch bei direktem Aufruf zuverlässig funktionieren.

### Partials

Wiederverwendbare Bausteine werden über Platzhalter-Kommentare eingebunden:

```html
<!-- @@HEADER@@ -->
<!-- @@FOOTER@@ -->
```

Diese werden beim Build automatisch durch den Inhalt der entsprechenden Datei in `src/partials/` ersetzt.

## Content-Konventionen

### Glossar

Unter `/glossar/` liegt ein zweisprachiges Fachbegriff-Glossar zur Tanzmedizin, aktuell 24 Begriffe in fünf Kategorien: Grundlagen, Verletzung & Prävention, Physiologie & Gesundheit, Psychische Gesundheit, Anatomie & Technik.

Jeder Begriff liegt unter `src/pages/glossar/[begriff]/index.html` und folgt einer festen sechsteiligen Struktur: Kurzdefinition, Im Tanzkontext, Warum das für Prävention wichtig ist, Hinweis, Quellen, Weiterführend. Inhalte sind reine Wissensvermittlung im Präventionskontext — keine Diagnosen oder Behandlungsempfehlungen, Sprache durchgängig gehedgt ("kann ein Hinweis sein auf …" statt "bedeutet …"). Quellen sind peer-reviewed oder stammen von anerkannten Fachorganisationen (IADMS, ta.med) und werden mit DOI oder Direktlink zitiert.

Die Übersichtsseite `src/pages/glossar/index.html` gruppiert die Begriffe in Kategorie-Karten (Kartenstil analog zur FAQ-Seite: weißer Außenrahmen, farbige/helle Innenkarten alternierend). Die Kategorie „Grundlagen" (Tanzmedizin, Interdisziplinäre Versorgung, Screening) steht als Einführung voran, volle Breite, drei Spalten mit Teaser-Text statt Linkliste. Begriffe innerhalb der übrigen Kategorien sind alphabetisch sortiert.

### CENIT Radar

Unter `/einblicke-entwicklungen/radar-[monat]-[jahr]/` erscheint monatlich ein kuratierter Newsletter mit aktuellen Entwicklungen aus Forschung, Szene und Veranstaltungen der Tanzmedizin (Rubriken: Veranstaltung des Monats, Szene & Kontext, Forschung, Glossar-Begriff des Monats, Im Kalender). Der Glossar-Begriff des Monats verweist jeweils auf einen noch nicht vorgestellten Eintrag im Glossar; welcher Begriff bereits verwendet wurde, wird pro Ausgabe dokumentiert, um Wiederholungen zu vermeiden.

### Förderaufrufe

Unter `/foerderaufrufe/` steht eine kuratierte, laufend aktualisierte Übersicht öffentlich zugänglicher EU-Förderprogramme (Horizon Europe, Erasmus+ Sport, COST u. a.) mit Relevanz für tanzmedizinische Forschung. Gegliedert in „Aktuell offen" und „Im Blick behalten" (Calls, deren nächste Runde noch nicht veröffentlicht ist). CENIT tritt hier nicht als Antragsteller auf, sondern als Orientierungshilfe für Hochschulen und Fachverbände im eigenen Netzwerk.

### Rechtliches

Bilinguale rechtliche Hinweise liegen unter `src/pages/de/impressum/` (DE) und `src/pages/en/legal-notice/` (EN), inklusive Anker-IDs für die Abschnitte Haftung für Links (`#haftung-fuer-links` / `#liability-for-links`) und Urheberrecht (`#urheberrecht` / `#copyright`). Glossar-Einträge mit externen Quellenverweisen verlinken auf diese Abschnitte.

## Build

```bash
node build.mjs
```

Erzeugt das vollständige, statische Website-Verzeichnis unter `dist/`. Vercel führt diesen Schritt automatisch bei jedem Deployment aus.

## Deployment

Jeder Push auf den `main`-Branch löst automatisch einen neuen Build und Deployment auf Vercel aus. Es ist kein manueller Deployment-Schritt erforderlich.

## Lizenz & Kontakt

© CENIT – Verein zur Förderung interdisziplinärer Tanzmedizin e.V.
Bei Fragen: [info@cenit-ev.de](mailto:info@cenit-ev.de)
