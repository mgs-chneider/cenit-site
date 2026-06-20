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
