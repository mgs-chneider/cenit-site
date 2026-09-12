/* ==========================================================
   CENIT Cookie-Einwilligung (eigenes, minimales Consent-Tool)
   Ersetzt Klaro!. Gate: Google Analytics 4 lädt erst nach
   Einwilligung ("googleAnalytics"), Infogram-Grafiken auf
   Zahlen & Fakten laden automatisch, sobald "infogram"
   zugestimmt wurde (siehe main.js: autoLoadAllInfogramEmbeds).
   Konfiguration über window.cenitConsentConfig = { gaId }.
========================================================== */
(function () {
  "use strict";

  var STORAGE_KEY = "cenit_consent_v1";
  var config = window.cenitConsentConfig || {};

  var TEXT = {
    de: {
      notice: "Wir verwenden Google Analytics zur anonymisierten Reichweitenmessung und binden interaktive Grafiken von Infogram ein. Beides lädt erst nach Ihrer Zustimmung.",
      settingsLink: "Einstellungen",
      acceptAll: "Alle akzeptieren",
      decline: "Ablehnen",
      acceptSelected: "Auswahl akzeptieren",
      close: "Schließen",
      modalTitle: "Datenschutzeinstellungen",
      modalDescription: "Wir nutzen auf dieser Seite einzelne Dienste, die personenbezogene Daten verarbeiten können. Sie entscheiden selbst, welche Sie zulassen – die Auswahl können Sie hier jederzeit wieder ändern.",
      services: {
        googleAnalytics: { title: "Google Analytics", description: "Anonymisierte Auswertung der Website-Nutzung (Google Ireland Limited)." },
        infogram: { title: "Infogram", description: "Interaktive Grafiken zur Darstellung von Studiendaten auf „Zahlen & Fakten\" (Infogram Inc.)." }
      }
    },
    en: {
      notice: "We use Google Analytics for anonymised traffic analysis and embed interactive charts from Infogram. Both only load after your consent.",
      settingsLink: "Settings",
      acceptAll: "Accept all",
      decline: "Decline",
      acceptSelected: "Accept selection",
      close: "Close",
      modalTitle: "Privacy settings",
      modalDescription: "We use a small number of services on this site that may process personal data. You decide which ones to allow – you can change your choice here at any time.",
      services: {
        googleAnalytics: { title: "Google Analytics", description: "Anonymised analysis of website usage (Google Ireland Limited)." },
        infogram: { title: "Infogram", description: "Interactive charts used to display study data on \"Facts & Figures\" (Infogram Inc.)." }
      }
    }
  };

  function getLang() {
    try {
      var stored = localStorage.getItem("cenit-lang");
      if (stored === "en" || stored === "de") return stored;
    } catch (e) {}
    return document.documentElement.lang === "en" ? "en" : "de";
  }

  function getStoredConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (typeof parsed.googleAnalytics === "boolean" && typeof parsed.infogram === "boolean") return parsed;
    } catch (e) {}
    return null;
  }

  function setStoredConsent(consent) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch (e) {}
  }

  function loadGoogleAnalytics() {
    if (window.__cenitGaLoaded || !config.gaId) return;
    window.__cenitGaLoaded = true;
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + config.gaId;
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", config.gaId);
  }

  function applyConsent(consent) {
    if (consent.googleAnalytics) loadGoogleAnalytics();
    if (consent.infogram && typeof window.autoLoadAllInfogramEmbeds === "function") {
      window.autoLoadAllInfogramEmbeds();
    }
  }

  function injectStyles() {
    if (document.getElementById("cenit-consent-styles")) return;
    var style = document.createElement("style");
    style.id = "cenit-consent-styles";
    style.textContent =
      ".cenit-consent-banner{position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#fff;border-top:1px solid rgba(0,0,0,.1);box-shadow:0 -2px 16px rgba(0,0,0,.08);padding:16px 20px;font-family:inherit}" +
      ".cenit-consent-banner-inner{max-width:1100px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;gap:16px;justify-content:space-between}" +
      ".cenit-consent-text{flex:1 1 320px;margin:0;font-size:14px;line-height:1.5;color:#2b2b2b}" +
      ".cenit-consent-actions{display:flex;gap:10px;flex-wrap:wrap}" +
      ".cenit-consent-btn{border:1px solid rgba(0,0,0,.15);background:#fff;color:#2b2b2b;border-radius:8px;padding:9px 16px;font-size:13px;cursor:pointer;white-space:nowrap}" +
      ".cenit-consent-btn:hover{border-color:rgba(0,0,0,.3)}" +
      ".cenit-consent-btn-primary{background:var(--cenit-purple,#4b2e83);border-color:var(--cenit-purple,#4b2e83);color:#fff}" +
      ".cenit-consent-btn-primary:hover{background:var(--cenit-gold,#b8964f);border-color:var(--cenit-gold,#b8964f)}" +
      ".cenit-consent-modal{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:20px}" +
      ".cenit-consent-modal[hidden]{display:none}" +
      ".cenit-consent-modal-inner{position:relative;background:#fff;border-radius:14px;max-width:520px;width:100%;padding:28px;max-height:85vh;overflow:auto}" +
      ".cenit-consent-modal-inner h2{margin:0 0 10px;font-size:19px;color:#2b2b2b}" +
      ".cenit-consent-modal-inner p{font-size:14px;line-height:1.55;color:#454545;margin:0 0 18px}" +
      ".cenit-consent-service{border:1px solid rgba(0,0,0,.1);border-radius:10px;padding:12px 14px;margin-bottom:10px}" +
      ".cenit-consent-service label{display:flex;gap:10px;align-items:flex-start;cursor:pointer;font-size:14px;color:#2b2b2b}" +
      ".cenit-consent-service input{margin-top:3px}" +
      ".cenit-consent-service-title{font-weight:600}" +
      ".cenit-consent-service-desc{display:block;font-weight:400;color:#5b5b5b;font-size:13px;margin-top:3px}" +
      ".cenit-consent-modal-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}" +
      ".cenit-consent-close{position:absolute;top:14px;right:14px;border:none;background:none;font-size:20px;line-height:1;cursor:pointer;color:#8a8a8a}" +
      ".cenit-consent-close:hover{color:#2b2b2b}";
    document.head.appendChild(style);
  }

  function buildBanner(lang, onAction) {
    var t = TEXT[lang];
    var banner = document.createElement("div");
    banner.className = "cenit-consent-banner";
    banner.id = "cenit-consent-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-live", "polite");

    var inner = document.createElement("div");
    inner.className = "cenit-consent-banner-inner";

    var text = document.createElement("p");
    text.className = "cenit-consent-text";
    text.textContent = t.notice;

    var actions = document.createElement("div");
    actions.className = "cenit-consent-actions";

    var settingsBtn = document.createElement("button");
    settingsBtn.className = "cenit-consent-btn";
    settingsBtn.textContent = t.settingsLink;
    settingsBtn.addEventListener("click", function () { onAction("settings"); });

    var declineBtn = document.createElement("button");
    declineBtn.className = "cenit-consent-btn";
    declineBtn.textContent = t.decline;
    declineBtn.addEventListener("click", function () { onAction("decline"); });

    var acceptBtn = document.createElement("button");
    acceptBtn.className = "cenit-consent-btn cenit-consent-btn-primary";
    acceptBtn.textContent = t.acceptAll;
    acceptBtn.addEventListener("click", function () { onAction("accept-all"); });

    actions.appendChild(settingsBtn);
    actions.appendChild(declineBtn);
    actions.appendChild(acceptBtn);
    inner.appendChild(text);
    inner.appendChild(actions);
    banner.appendChild(inner);
    return banner;
  }

  function buildModal(lang, currentConsent, onAction) {
    var t = TEXT[lang];
    var modal = document.createElement("div");
    modal.className = "cenit-consent-modal";
    modal.id = "cenit-consent-modal";

    var inner = document.createElement("div");
    inner.className = "cenit-consent-modal-inner";

    var closeBtn = document.createElement("button");
    closeBtn.className = "cenit-consent-close";
    closeBtn.setAttribute("aria-label", t.close);
    closeBtn.textContent = "×";
    closeBtn.addEventListener("click", function () { onAction("close"); });

    var title = document.createElement("h2");
    title.textContent = t.modalTitle;

    var desc = document.createElement("p");
    desc.textContent = t.modalDescription;

    var gaService = buildServiceRow(t.services.googleAnalytics, "googleAnalytics", currentConsent.googleAnalytics);
    var infogramService = buildServiceRow(t.services.infogram, "infogram", currentConsent.infogram);

    var actions = document.createElement("div");
    actions.className = "cenit-consent-modal-actions";

    var declineBtn = document.createElement("button");
    declineBtn.className = "cenit-consent-btn";
    declineBtn.textContent = t.decline;
    declineBtn.addEventListener("click", function () { onAction("decline"); });

    var acceptSelectedBtn = document.createElement("button");
    acceptSelectedBtn.className = "cenit-consent-btn";
    acceptSelectedBtn.textContent = t.acceptSelected;
    acceptSelectedBtn.addEventListener("click", function () {
      onAction("accept-selected", {
        googleAnalytics: gaService.querySelector("input").checked,
        infogram: infogramService.querySelector("input").checked
      });
    });

    var acceptAllBtn = document.createElement("button");
    acceptAllBtn.className = "cenit-consent-btn cenit-consent-btn-primary";
    acceptAllBtn.textContent = t.acceptAll;
    acceptAllBtn.addEventListener("click", function () { onAction("accept-all"); });

    actions.appendChild(declineBtn);
    actions.appendChild(acceptSelectedBtn);
    actions.appendChild(acceptAllBtn);

    inner.appendChild(closeBtn);
    inner.appendChild(title);
    inner.appendChild(desc);
    inner.appendChild(gaService);
    inner.appendChild(infogramService);
    inner.appendChild(actions);
    modal.appendChild(inner);
    return modal;
  }

  function buildServiceRow(serviceText, key, checked) {
    var row = document.createElement("div");
    row.className = "cenit-consent-service";
    var label = document.createElement("label");
    var input = document.createElement("input");
    input.type = "checkbox";
    input.dataset.service = key;
    input.checked = !!checked;
    var textWrap = document.createElement("span");
    var titleSpan = document.createElement("span");
    titleSpan.className = "cenit-consent-service-title";
    titleSpan.textContent = serviceText.title;
    var descSpan = document.createElement("span");
    descSpan.className = "cenit-consent-service-desc";
    descSpan.textContent = serviceText.description;
    textWrap.appendChild(titleSpan);
    textWrap.appendChild(descSpan);
    label.appendChild(input);
    label.appendChild(textWrap);
    row.appendChild(label);
    return row;
  }

  function init() {
    injectStyles();
    var lang = getLang();
    var stored = getStoredConsent();

    if (stored) {
      applyConsent(stored);
      return;
    }

    var banner = buildBanner(lang, handleBannerAction);
    document.body.appendChild(banner);

    function handleBannerAction(action) {
      if (action === "accept-all") {
        finish({ googleAnalytics: true, infogram: true });
      } else if (action === "decline") {
        finish({ googleAnalytics: false, infogram: false });
      } else if (action === "settings") {
        openModal({ googleAnalytics: false, infogram: false });
      }
    }

    function openModal(currentConsent) {
      var existing = document.getElementById("cenit-consent-modal");
      if (existing) existing.remove();
      var modal = buildModal(lang, currentConsent, function (action, selection) {
        if (action === "close") {
          modal.remove();
          return;
        }
        if (action === "accept-all") {
          modal.remove();
          finish({ googleAnalytics: true, infogram: true });
        } else if (action === "decline") {
          modal.remove();
          finish({ googleAnalytics: false, infogram: false });
        } else if (action === "accept-selected") {
          modal.remove();
          finish(selection);
        }
      });
      document.body.appendChild(modal);
    }

    function finish(consent) {
      setStoredConsent(consent);
      var el = document.getElementById("cenit-consent-banner");
      if (el) el.remove();
      applyConsent(consent);
    }

    window.__cenitOpenSettingsModal = function () {
      var current = getStoredConsent() || { googleAnalytics: false, infogram: false };
      openModal(current);
    };
  }

  window.cenitConsent = {
    show: function () {
      injectStyles();
      var lang = getLang();
      var current = getStoredConsent() || { googleAnalytics: false, infogram: false };
      var existing = document.getElementById("cenit-consent-modal");
      if (existing) existing.remove();
      var modal = buildModal(lang, current, function (action, selection) {
        if (action === "close") {
          modal.remove();
          return;
        }
        var consent;
        if (action === "accept-all") consent = { googleAnalytics: true, infogram: true };
        else if (action === "decline") consent = { googleAnalytics: false, infogram: false };
        else if (action === "accept-selected") consent = selection;
        modal.remove();
        if (consent) {
          setStoredConsent(consent);
          applyConsent(consent);
        }
      });
      document.body.appendChild(modal);
    }
  };

  // Immer auf DOMContentLoaded warten, nicht nur wenn readyState "loading" ist:
  // main.js (definiert autoLoadAllInfogramEmbeds) wird im Layout NACH diesem
  // Script eingebunden, ist bei is:inline+defer aber erst nach DOMContentLoaded
  // garantiert vollständig ausgeführt.
  document.addEventListener("DOMContentLoaded", init);
})();
