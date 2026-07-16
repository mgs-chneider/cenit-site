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
- Cookie-Consent über [Klaro!](https://kiprotect.com/klaro) (CDN, kein eigenes Hosting): gated Google Analytics und die Infogram-Grafiken auf `/zahlen-fakten/` hinter aktiver Einwilligung gemäß § 25 TDDDG / Art. 6(1)(a) DSGVO

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

Unter `/foerderaufrufe/` steht eine kuratierte, laufend aktualisierte Übersicht öffentlich zugänglicher EU-Förderprogramme (Horizon Europe, Erasmus+ Sport, COST u. a.) mit Relevanz für tanzmedizinische Forschung. Gegliedert in „Aktuell offen" und „Im Blick behalten" (Calls, deren nächste Runde noch nicht veröffentlicht ist). CENIT tritt hier nicht als Antragsteller auf, sondern als Orientierungshilfe für Hochschulen und Fachverbände im eigenen Netzwerk. Der Disclaimer nennt ausschließlich die tatsächlich zuständigen EU-Stellen je Programm (COST Association, REA, EACEA) — die Zuordnung wird bei jeder Aktualisierung geprüft, nicht pauschal übernommen.

### Zahlen & Fakten

Unter `/zahlen-fakten/` liegt die evidenzbasierte Beleg-Seite der Website, mit zwei redaktionell getrennten Kapiteln: Verletzungsprävalenz/-häufigkeit im Tanz (Infogram-Grafiken, Anker `#verletzungen` implizit über die Chart-Sektion) und „Prävention rechnet sich" für Kostenträger (`#kostentraeger`, ökonomische Evidenz plus Praxisbeispiele wie die VBG-Tanzpräventionsinitiative). Die Seite ist im Hauptmenü verlinkt und wird zusätzlich auf der Startseite in einer Teaser-Sektion zwischen Hero und Vision & Mission zusammengefasst (Problemseite: Verletzungszahlen als Auslöser für die Vision; die Kostenträger-Ökonomie bleibt bewusst exklusiv auf der Unterseite). Die Infogram-Charts laden erst nach Klaro-Einwilligung (Consent-Gate, siehe Tech-Stack); bei bereits erteilter Einwilligung laden sie beim Seitenaufruf automatisch nach.

### Rechtliches

Bilinguale rechtliche Hinweise liegen unter `src/pages/de/impressum/` (DE) und `src/pages/en/legal-notice/` (EN), inklusive Anker-IDs für die Abschnitte Haftung für Links (`#haftung-fuer-links` / `#liability-for-links`) und Urheberrecht (`#urheberrecht` / `#copyright`). Glossar-Einträge mit externen Quellenverweisen verlinken auf diese Abschnitte.

Datenschutzerklärung/Privacy Policy liegen unter `src/pages/de/datenschutz/` (DE) und `src/pages/en/privacy/` (EN) und dokumentieren Google Analytics sowie die Infogram-Einbindung auf Consent-Basis (Klaro!, siehe Tech-Stack). Diese vier Rechts-Seiten binden Header/Footer nicht über `@@HEADER@@`/`@@FOOTER@@` ein, sondern direkt inline — Änderungen an Header oder Footer müssen hier manuell nachgezogen werden.

### UI-Konventionen

Externe Link-Buttons und Inline-Links verwenden statt des Unicode-Zeichens „↗" ein inline-SVG (`.cenit-arrow-icon`, `currentColor`-Stroke), da „↗" auf iOS/mobilen Geräten als großes, kastenförmiges Farb-Emoji dargestellt wird. Ausnahme: auf den CENIT-Radar-Seiten (`/einblicke-entwicklungen/radar-*/`) werden Link-Buttons bewusst ganz ohne Pfeil-Symbol gesetzt (weder Unicode noch SVG), auf Wunsch schlankerer Optik bei vielen Links pro Ausgabe.

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
