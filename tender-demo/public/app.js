// TenderBrief demo client: PIN gate, PDF upload (or in-browser text
// extraction for large files), and rendering of the structured analysis.

// Vercel rejects request bodies above 4.5 MB; base64 adds a third.
const MAX_PDF_UPLOAD_BYTES = 3.2 * 1024 * 1024;
// Keep in sync with MAX_TEXT_CHARS in api/analyze.js.
const MAX_TEXT_CHARS = 600_000;
const PIN_KEY = "tenderbrief-pin";

// Currencies with a fixed euro peg; everything else is shown without conversion.
const FIXED_EUR_RATES = {
  EUR: 1,
  XOF: 655.957, // franc CFA (UEMOA)
  XAF: 655.957, // franc CFA (CEMAC)
  KMF: 491.96775, // franc comorien
  CVE: 110.265, // escudo cabo-verdiano
};

const LABELS = {
  de: {
    go: "Go – Angebot empfehlenswert",
    conditional: "Bedingt – Angebot nur unter Voraussetzungen",
    no_go: "No-Go – Angebot nicht empfehlenswert",
    strengths: "Dafür spricht",
    concerns: "Dagegen spricht",
    overview: "Eckdaten",
    country: "Land",
    contracting_authority: "Auftraggeber",
    funder: "Finanzierung",
    sector: "Sektor",
    procurement_method: "Verfahren",
    contract_type: "Vertragsart",
    duration: "Laufzeit",
    summary: "Kurzfassung",
    deadlines: "Fristen",
    amounts: "Beträge",
    item: "Posten",
    date: "Datum",
    value: "Betrag",
    page: "S.",
    fixedRate: "fester Kurs",
    noConversion: "kein fester Kurs – nicht umgerechnet",
    scope: "Leistungsumfang",
    experts: "Schlüsselexperten",
    position: "Position",
    qualifications: "Anforderungen",
    personDays: "Personentage",
    eligibility: "Teilnahmebedingungen und Referenzen",
    evaluation: "Bewertung der Angebote",
    method: "Methode",
    technical: "Technisch",
    financial: "Finanziell",
    risks: "Risiken",
    severity: { high: "hoch", medium: "mittel", low: "gering" },
    openQuestions: "Offene Fragen",
    glossary: "Fachbegriffe",
    reference: "Referenz",
    sourceLanguage: "Originalsprache",
    generated: "Erstellt",
    disclaimer: "Automatische Erstauswertung – Angaben vor Verwendung im Originaldokument prüfen.",
    none: "Keine Angaben im Dokument.",
  },
  en: {
    go: "Go – worth bidding",
    conditional: "Conditional – bid only if conditions are met",
    no_go: "No-go – not worth pursuing",
    strengths: "In favour",
    concerns: "Against",
    overview: "Key facts",
    country: "Country",
    contracting_authority: "Contracting authority",
    funder: "Funding",
    sector: "Sector",
    procurement_method: "Procedure",
    contract_type: "Contract type",
    duration: "Duration",
    summary: "Summary",
    deadlines: "Deadlines",
    amounts: "Amounts",
    item: "Item",
    date: "Date",
    value: "Amount",
    page: "p.",
    fixedRate: "fixed rate",
    noConversion: "no fixed rate – not converted",
    scope: "Scope of services",
    experts: "Key experts",
    position: "Position",
    qualifications: "Requirements",
    personDays: "Person-days",
    eligibility: "Eligibility and references",
    evaluation: "Evaluation",
    method: "Method",
    technical: "Technical",
    financial: "Financial",
    risks: "Risks",
    severity: { high: "high", medium: "medium", low: "low" },
    openQuestions: "Open questions",
    glossary: "Glossary",
    reference: "Reference",
    sourceLanguage: "Source language",
    generated: "Generated",
    disclaimer: "Automated first screening – verify figures against the original document before use.",
    none: "Not specified in the document.",
  },
};

const LOADING_STEPS = [
  "Dokument wird gelesen …",
  "Fristen und Beträge werden erfasst …",
  "Anforderungen und Risiken werden geprüft …",
  "Einschätzung wird formuliert …",
];

const $ = (id) => document.getElementById(id);
let selectedFile = null;
let lastResult = null;

// ---------- storage (may be unavailable in private mode) ----------

function readPin() {
  try { return sessionStorage.getItem(PIN_KEY); } catch { return null; }
}
function storePin(pin) {
  try { sessionStorage.setItem(PIN_KEY, pin); } catch { /* keep in memory only */ }
  memoryPin = pin;
}
function clearPin() {
  try { sessionStorage.removeItem(PIN_KEY); } catch { /* ignore */ }
  memoryPin = null;
}
let memoryPin = null;
const currentPin = () => memoryPin ?? readPin();

// ---------- views ----------

function show(view) {
  for (const id of ["view-pin", "view-upload", "view-loading", "view-result"]) {
    $(id).hidden = id !== view;
  }
  window.scrollTo({ top: 0 });
}

function showError(el, message) {
  el.textContent = message;
  el.hidden = !message;
}

// ---------- PIN ----------

async function submitPin(event) {
  event.preventDefault();
  const pin = $("pin-input").value.trim();
  showError($("pin-error"), "");
  try {
    const res = await fetch("/api/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (!res.ok) throw new Error("PIN ungültig");
    storePin(pin);
    show("view-upload");
  } catch (err) {
    showError($("pin-error"), err.message === "PIN ungültig" ? "PIN ungültig." : "Verbindung fehlgeschlagen.");
  }
}

// ---------- file handling ----------

function selectFile(file) {
  showError($("upload-error"), "");
  if (!file) return;
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    showError($("upload-error"), "Bitte eine PDF-Datei wählen.");
    return;
  }
  selectedFile = file;
  $("dropzone").classList.add("has-file");
  $("dropzone-label").innerHTML = `<strong>${escapeHtml(file.name)}</strong>`;
  $("file-meta").textContent = `${formatSize(file.size)} – andere Datei wählen`;
  $("analyze-btn").disabled = false;
}

function formatSize(bytes) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function readAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = () => reject(new Error("Datei konnte nicht gelesen werden."));
    reader.readAsDataURL(file);
  });
}

async function extractText(file) {
  const pdfjs = await import("/vendor/pdf.min.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = "/vendor/pdf.worker.min.mjs";
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const content = await page.getTextContent();
    const text = content.items.map((item) => item.str + (item.hasEOL ? "\n" : " ")).join("");
    pages.push(`[Page ${n}]\n${text.trim()}`);
  }
  return pages.join("\n\n");
}

async function buildPayload(file) {
  if (file.size <= MAX_PDF_UPLOAD_BYTES) {
    return { pdfBase64: await readAsBase64(file) };
  }
  const text = await extractText(file);
  const letters = text.replace(/\[Page \d+\]/g, "").replace(/\s/g, "").length;
  if (letters < 200) {
    throw new Error("Die PDF ist zu groß und enthält keinen lesbaren Text (vermutlich gescannt). Bitte eine kleinere Datei verwenden.");
  }
  if (text.length > MAX_TEXT_CHARS) {
    throw new Error("Das Dokument ist für die Demo zu lang. Bitte nur den relevanten Teil (z. B. die Termes de référence) hochladen.");
  }
  return { extractedText: text };
}

// ---------- analysis ----------

async function analyze() {
  if (!selectedFile) return;
  const outputLanguage = document.querySelector('input[name="lang"]:checked').value;
  showError($("upload-error"), "");
  show("view-loading");
  let step = 0;
  $("loading-step").textContent = LOADING_STEPS[0];
  const ticker = setInterval(() => {
    step = Math.min(step + 1, LOADING_STEPS.length - 1);
    $("loading-step").textContent = LOADING_STEPS[step];
  }, 12000);

  try {
    const payload = await buildPayload(selectedFile);
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: currentPin(), filename: selectedFile.name, outputLanguage, ...payload }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
      clearPin();
      show("view-pin");
      showError($("pin-error"), "Bitte PIN erneut eingeben.");
      return;
    }
    if (res.status === 413) throw new Error("Die Datei ist zu groß für die Demo.");
    if (!res.ok) throw new Error(data.error || "Die Analyse ist fehlgeschlagen.");
    lastResult = { analysis: data.analysis, lang: outputLanguage, filename: selectedFile.name, at: new Date() };
    $("result").innerHTML = renderAnalysis(lastResult);
    show("view-result");
  } catch (err) {
    show("view-upload");
    showError($("upload-error"), err.message);
  } finally {
    clearInterval(ticker);
  }
}

// ---------- rendering ----------

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function formatAmount(value, currency, lang) {
  const locale = lang === "de" ? "de-DE" : "en-GB";
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
  return currency ? `${number} ${currency}` : number;
}

function formatDate(iso, lang) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(lang === "de" ? "de-DE" : "en-GB", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "UTC",
  });
}

export function toEur(value, currency) {
  const rate = FIXED_EUR_RATES[(currency || "").toUpperCase()];
  if (value == null || !rate) return null;
  return value / rate;
}

function section(title, body) {
  return `<section class="card section"><h2>${escapeHtml(title)}</h2>${body}</section>`;
}

function bulletList(items, L) {
  if (!items?.length) return `<p class="muted">${escapeHtml(L.none)}</p>`;
  return `<ul class="list">${items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
}

function pageRef(page, L) {
  return page ? ` <span class="page">(${L.page} ${escapeHtml(page)})</span>` : "";
}

function renderDeadlines(deadlines, L, lang) {
  if (!deadlines?.length) return `<p class="muted">${escapeHtml(L.none)}</p>`;
  const today = new Date().toISOString().slice(0, 10);
  const sorted = [...deadlines].sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));
  const nextDate = sorted.find((d) => d.date && d.date >= today)?.date;
  const rows = sorted.map((d) => {
    const cls = d.date && d.date < today ? "past" : d.date === nextDate ? "next" : "";
    const when = d.date ? formatDate(d.date, lang) : "–";
    return `<tr>
      <td class="num ${cls}">${escapeHtml(when)}${d.time ? `<br><span class="page">${escapeHtml(d.time)}</span>` : ""}</td>
      <td>${escapeHtml(d.label)}${pageRef(d.source_page, L)}${d.original_text ? `<span class="original">„${escapeHtml(d.original_text)}“</span>` : ""}</td>
    </tr>`;
  });
  return `<div class="table-wrap"><table><thead><tr><th>${L.date}</th><th>${L.item}</th></tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
}

function renderAmounts(amounts, L, lang) {
  if (!amounts?.length) return `<p class="muted">${escapeHtml(L.none)}</p>`;
  const rows = amounts.map((a) => {
    const eur = toEur(a.value, a.currency);
    let value = a.value == null ? "–" : escapeHtml(formatAmount(a.value, a.currency, lang));
    if (eur != null && a.currency.toUpperCase() !== "EUR") {
      value += `<span class="eur">≈ ${escapeHtml(formatAmount(Math.round(eur), "EUR", lang))} <span class="page">(${L.fixedRate})</span></span>`;
    } else if (a.value != null && eur == null) {
      value += `<span class="page">${L.noConversion}</span>`;
    }
    return `<tr>
      <td>${escapeHtml(a.label)}${pageRef(a.source_page, L)}${a.original_text ? `<span class="original">„${escapeHtml(a.original_text)}“</span>` : ""}</td>
      <td class="num">${value}</td>
    </tr>`;
  });
  return `<div class="table-wrap"><table><thead><tr><th>${L.item}</th><th>${L.value}</th></tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
}

function renderExperts(experts, L) {
  if (!experts?.length) return `<p class="muted">${escapeHtml(L.none)}</p>`;
  const rows = experts.map((e) => `<tr>
    <td><strong>${escapeHtml(e.position)}</strong></td>
    <td>${escapeHtml(e.qualifications)}</td>
    <td class="num">${escapeHtml(e.person_days || "–")}</td>
  </tr>`);
  return `<div class="table-wrap"><table><thead><tr><th>${L.position}</th><th>${L.qualifications}</th><th>${L.personDays}</th></tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
}

function renderFacts(overview, L) {
  const keys = ["country", "contracting_authority", "funder", "sector", "procurement_method", "contract_type", "duration"];
  const items = keys
    .filter((k) => overview?.[k])
    .map((k) => `<div><dt>${L[k]}</dt><dd>${escapeHtml(overview[k])}</dd></div>`);
  return `<dl class="facts">${items.join("")}</dl>`;
}

function renderAnalysis({ analysis: a, lang, filename, at }) {
  const L = LABELS[lang];
  const rec = a.assessment?.recommendation ?? "conditional";
  const refLine = [a.document?.reference && `${L.reference}: ${a.document.reference}`, a.document?.document_type, a.document?.source_language && `${L.sourceLanguage}: ${a.document.source_language}`]
    .filter(Boolean)
    .map(escapeHtml)
    .join(" · ");

  const evaluation = a.evaluation ?? {};
  const weights = [evaluation.technical_weight && `${L.technical}: ${evaluation.technical_weight}`, evaluation.financial_weight && `${L.financial}: ${evaluation.financial_weight}`]
    .filter(Boolean)
    .join(" · ");

  return `
    <section class="card section headline">
      <h1>${escapeHtml(a.document?.title || filename)}</h1>
      ${refLine ? `<p class="ref">${refLine}</p>` : ""}
      <div class="verdict ${escapeHtml(rec)}">
        <div class="label">${escapeHtml(L[rec] ?? rec)}</div>
        <p>${escapeHtml(a.assessment?.rationale)}</p>
        <div class="cols">
          <div><h3>${L.strengths}</h3>${bulletList(a.assessment?.strengths, L)}</div>
          <div><h3>${L.concerns}</h3>${bulletList(a.assessment?.concerns, L)}</div>
        </div>
      </div>
      ${a.overview?.summary ? `<h3>${L.summary}</h3><p>${escapeHtml(a.overview.summary)}</p>` : ""}
      ${renderFacts(a.overview, L)}
    </section>
    ${section(L.deadlines, renderDeadlines(a.deadlines, L, lang))}
    ${section(L.amounts, renderAmounts(a.amounts, L, lang))}
    ${section(L.scope, bulletList(a.scope, L))}
    ${section(L.experts, renderExperts(a.key_experts, L))}
    ${section(L.eligibility, bulletList(a.eligibility, L))}
    ${section(L.evaluation, `${evaluation.method ? `<p><strong>${L.method}:</strong> ${escapeHtml(evaluation.method)}</p>` : ""}${weights ? `<p>${escapeHtml(weights)}</p>` : ""}${bulletList(evaluation.criteria, L)}`)}
    ${section(L.risks, a.risks?.length
      ? `<ul class="list">${a.risks.map((r) => `<li><span class="sev ${escapeHtml(r.severity)}">${escapeHtml(L.severity[r.severity] ?? r.severity)}</span>${escapeHtml(r.risk)}</li>`).join("")}</ul>`
      : `<p class="muted">${escapeHtml(L.none)}</p>`)}
    ${section(L.openQuestions, bulletList(a.open_questions, L))}
    ${section(L.glossary, a.glossary?.length
      ? `<dl class="glossary">${a.glossary.map((g) => `<dt>${escapeHtml(g.source_term)} → <span class="tr">${escapeHtml(g.translation)}</span></dt><dd>${escapeHtml(g.explanation)}</dd>`).join("")}</dl>`
      : `<p class="muted">${escapeHtml(L.none)}</p>`)}
    <p class="meta">${escapeHtml(L.generated)}: ${escapeHtml(at.toLocaleString(lang === "de" ? "de-DE" : "en-GB"))} · ${escapeHtml(filename)}<br>${escapeHtml(L.disclaimer)}</p>
  `;
}

// ---------- plain-text export ----------

function toPlainText({ analysis: a, lang, filename }) {
  const L = LABELS[lang];
  const lines = [];
  const list = (title, items) => {
    if (!items?.length) return;
    lines.push("", title.toUpperCase(), ...items.map((i) => `- ${i}`));
  };
  lines.push(a.document?.title || filename);
  if (a.document?.reference) lines.push(`${L.reference}: ${a.document.reference}`);
  lines.push("", `${L[a.assessment?.recommendation] ?? ""}`, a.assessment?.rationale ?? "");
  list(L.strengths, a.assessment?.strengths);
  list(L.concerns, a.assessment?.concerns);
  if (a.overview?.summary) lines.push("", L.summary.toUpperCase(), a.overview.summary);
  const facts = ["country", "contracting_authority", "funder", "sector", "procurement_method", "contract_type", "duration"]
    .filter((k) => a.overview?.[k])
    .map((k) => `${L[k]}: ${a.overview[k]}`);
  list(L.overview, facts);
  list(L.deadlines, (a.deadlines ?? []).map((d) => `${d.date ? formatDate(d.date, lang) : "–"}${d.time ? ` ${d.time}` : ""}: ${d.label}`));
  list(L.amounts, (a.amounts ?? []).map((m) => {
    const eur = toEur(m.value, m.currency);
    const eurText = eur != null && m.currency.toUpperCase() !== "EUR" ? ` (≈ ${formatAmount(Math.round(eur), "EUR", lang)})` : "";
    return `${m.label}: ${m.value == null ? "–" : formatAmount(m.value, m.currency, lang)}${eurText}`;
  }));
  list(L.scope, a.scope);
  list(L.experts, (a.key_experts ?? []).map((e) => `${e.position}${e.person_days ? ` (${e.person_days})` : ""}: ${e.qualifications}`));
  list(L.eligibility, a.eligibility);
  list(L.risks, (a.risks ?? []).map((r) => `[${L.severity[r.severity] ?? r.severity}] ${r.risk}`));
  list(L.openQuestions, a.open_questions);
  list(L.glossary, (a.glossary ?? []).map((g) => `${g.source_term} = ${g.translation}: ${g.explanation}`));
  lines.push("", L.disclaimer);
  return lines.join("\n");
}

async function copyResult() {
  if (!lastResult) return;
  const button = $("copy-btn");
  try {
    await navigator.clipboard.writeText(toPlainText(lastResult));
    button.textContent = "Kopiert ✓";
  } catch {
    button.textContent = "Kopieren nicht möglich";
  }
  setTimeout(() => { button.textContent = "Als Text kopieren"; }, 2000);
}

function resetUpload() {
  selectedFile = null;
  $("file-input").value = "";
  $("dropzone").classList.remove("has-file");
  $("dropzone-label").innerHTML = "<strong>PDF auswählen</strong> oder hierher ziehen";
  $("file-meta").textContent = "";
  $("analyze-btn").disabled = true;
  show("view-upload");
}

// ---------- wiring ----------

function init() {
  $("pin-form").addEventListener("submit", submitPin);
  $("file-input").addEventListener("change", (e) => selectFile(e.target.files[0]));
  const dz = $("dropzone");
  dz.addEventListener("dragover", (e) => { e.preventDefault(); dz.classList.add("dragover"); });
  dz.addEventListener("dragleave", () => dz.classList.remove("dragover"));
  dz.addEventListener("drop", (e) => {
    e.preventDefault();
    dz.classList.remove("dragover");
    selectFile(e.dataTransfer.files[0]);
  });
  $("analyze-btn").addEventListener("click", analyze);
  $("new-btn").addEventListener("click", resetUpload);
  $("copy-btn").addEventListener("click", copyResult);
  $("print-btn").addEventListener("click", () => window.print());
  show(currentPin() ? "view-upload" : "view-pin");
}

if (typeof document !== "undefined") init();

export { renderAnalysis, toPlainText };
