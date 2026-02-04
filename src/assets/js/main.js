// CENIT main.js
// - Language switch (data-lang="de|en")
// - Hamburger menu toggle
// - Close menu on outside click / ESC

(function () {
  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function () {
    // -----------------------------
    // MENU TOGGLE
    // -----------------------------
    var toggleBtn = document.querySelector(".cenit-menutoggle");
    var menu = document.querySelector(".cenit-menu");

    function closeMenu() {
      if (!menu) return;
      menu.classList.remove("show");
      if (toggleBtn) toggleBtn.setAttribute("aria-expanded", "false");
    }

    function toggleMenu() {
      if (!menu) return;
      var isOpen = menu.classList.toggle("show");
      if (toggleBtn) toggleBtn.setAttribute("aria-expanded", String(isOpen));
    }

    if (toggleBtn && menu) {
      toggleBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
      });

      document.addEventListener("click", function (e) {
        if (!menu.classList.contains("show")) return;
        var target = e.target;
        if (!menu.contains(target) && !toggleBtn.contains(target)) closeMenu();
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeMenu();
      });

      toggleBtn.setAttribute("aria-controls", "cenit-menu");
      toggleBtn.setAttribute("aria-expanded", "false");
      if (!menu.id) menu.id = "cenit-menu";
    }

    // -----------------------------
    // LANGUAGE SWITCH
    // -----------------------------
    var langButtons = document.querySelectorAll(".cenit-langbtn[data-set-lang]");
    var allLangNodes = document.querySelectorAll("[data-lang]");

    function setLang(lang) {
      allLangNodes.forEach(function (node) {
        node.style.display = node.getAttribute("data-lang") === lang ? "" : "none";
      });

      langButtons.forEach(function (btn) {
        btn.classList.toggle("is-active", btn.getAttribute("data-set-lang") === lang);
      });

      try {
        localStorage.setItem("cenit-lang", lang);
      } catch (_) {}

      document.documentElement.setAttribute("lang", lang);
    }

    if (langButtons.length && allLangNodes.length) {
      langButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var lang = btn.getAttribute("data-set-lang");
          setLang(lang);
        });
      });

      var initial = "de";
      try {
        initial = localStorage.getItem("cenit-lang") || "de";
      } catch (_) {}

      setLang(initial);
    }
  });
})();

// ===== Language Switch (DE/EN) + i18n for menu labels =====
(function () {
  const buttons = document.querySelectorAll(".cenit-langbtn[data-set-lang]");
  if (!buttons.length) return;

  const dict = {
    de: {
      menuLabel: "Menü",
      vision: "Vision",
      about: "Über uns",
      expertise: "Expertise",
      insights: "Einblicke & Entwicklungen",
      faqs: "FAQs",
      contact: "Kontakt",
      statutes: "Satzung",
      sources: "Quellen:"
    },
    en: {
      menuLabel: "Menu",
      vision: "Vision",
      about: "About us",
      expertise: "Expertise",
      insights: "Insights & Updates",
      faqs: "FAQs",
      contact: "Contact",
      statutes: "Statutes",
      sources: "Sources:"
    }
  };

  const applyLang = (lang) => {
    const L = dict[lang] ? lang : "de";
    document.documentElement.lang = L;

    // Toggle data-lang blocks (you already use these in sources)
    document.querySelectorAll("[data-lang]").forEach((el) => {
      el.style.display = (el.getAttribute("data-lang") === L) ? "" : "none";
    });

    // Translate all elements with data-i18n (menu + labels)
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[L][key]) el.textContent = dict[L][key];
    });

    // Optional: translate "Quellen:" labels if you keep them as plain spans
    document.querySelectorAll(".cenit-zf-sources span").forEach((el) => {
      if (el.textContent.trim().toLowerCase().startsWith("quellen")) el.textContent = dict[L].sources;
      if (el.textContent.trim().toLowerCase().startsWith("sources")) el.textContent = dict[L].sources;
    });

    // Active state
    buttons.forEach((b) => b.classList.toggle("is-active", b.dataset.setLang === L));

    // Remember
    try { localStorage.setItem("cenit_lang", L); } catch(e) {}
  };

  buttons.forEach((btn) => btn.addEventListener("click", () => applyLang(btn.dataset.setLang)));

  let initial = "de";
  try { initial = localStorage.getItem("cenit_lang") || initial; } catch(e) {}
  applyLang(initial);
})();

