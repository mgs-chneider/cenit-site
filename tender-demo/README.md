# TenderBrief – Demo Ausschreibungsanalyse

Web-App (PWA), die französische und spanische Ausschreibungsunterlagen (Termes de référence, DAO, Términos de referencia …) in etwa einer Minute auf Deutsch oder Englisch aufbereitet:

- Eckdaten (Land, Auftraggeber, Finanzierer, Verfahren, Laufzeit)
- Fristen, chronologisch, mit Originalzitat und Seitenangabe
- Beträge mit Originalzitat und Seitenangabe; FCFA (XOF/XAF) werden zum festen Kurs in Euro umgerechnet
- Leistungsumfang, Schlüsselexperten, Teilnahmebedingungen, Bewertungskriterien
- Risiken, offene Fragen, Glossar der Fachbegriffe
- Erste Go / Bedingt / No-Go-Einschätzung gegen ein konfigurierbares Firmenprofil
- Export als Text (für E-Mails) oder Druck/PDF

Die Analyse läuft über die Claude-API (Modell `claude-opus-5`, strukturierte JSON-Ausgabe). Die App speichert keine Dokumente.

## Aufbau

```
tender-demo/
  api/analyze.js      Serverless-Funktion: PIN, Tageslimit, Aufruf der Claude-API
  api/pin.js          PIN-Prüfung für den Login-Bildschirm
  lib/                JSON-Schema, System-Prompt, PIN und Tageslimit (Upstash)
  public/             Oberfläche (HTML/CSS/JS, Manifest, Icons)
  scripts/            Vendor-Kopie (pdf.js), lokaler Dev-Server, Smoke-Test
```

PDFs bis ca. 3 MB werden direkt an Claude geschickt (inkl. Tabellen und gescannter Seiten). Größere PDFs werden im Browser mit pdf.js in Text umgewandelt, weil Vercel Anfragen über 4,5 MB ablehnt; gescannte Seiten ohne Textebene fehlen dann.

## Deployment auf Vercel

1. Neues Vercel-Projekt aus diesem Repository anlegen, **Root Directory: `tender-demo`**, Framework Preset „Other“.
2. Umgebungsvariablen setzen:

   | Variable | Pflicht | Bedeutung |
   | --- | --- | --- |
   | `ANTHROPIC_API_KEY` | ja | API-Schlüssel aus der Claude Console (Prepaid-Guthaben, Auto-Aufladen aus) |
   | `DEMO_PIN` | ja | PIN für den Zugang |
   | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | empfohlen | Aktiviert das Tageslimit |
   | `DAILY_LIMIT` | nein | Analysen pro Tag (Standard 25) |
   | `ANALYSIS_EFFORT` | nein | `low` / `medium` (Standard) / `high` – Gründlichkeit vs. Dauer und Kosten |
   | `COMPANY_PROFILE` | nein | Firmenprofil für die Go/No-Go-Einschätzung (englisch, Freitext) |

3. Deployen. Die Funktion `api/analyze.js` darf bis zu 300 Sekunden laufen (`vercel.json`).
4. Auf dem Smartphone die URL öffnen und „Zum Home-Bildschirm hinzufügen“.

Kosten: pro Analyse je nach Dokumentumfang grob einige Cent bis rund einen Euro an API-Gebühren.

## Lokal testen

```bash
npm install
npm run build                       # kopiert pdf.js nach public/vendor
npm run check                       # Syntax-Check + Smoke-Test mit simulierter API
DEMO_PIN=1234 ANTHROPIC_API_KEY=... node scripts/dev-server.mjs   # http://localhost:3000
```

## Grenzen der Demo

- Erste Einschätzung zur Unterstützung, keine verbindliche Übersetzung oder Rechtsprüfung. Zahlen und Fristen immer im Original prüfen – dafür stehen Zitat und Seitenzahl neben jedem Wert.
- Für die Demo nur öffentliche Ausschreibungen verwenden. Für echte Kundendokumente vorher Datenschutz (Auftragsverarbeitung) klären.
- Ein gemeinsamer PIN statt Benutzerkonten.
