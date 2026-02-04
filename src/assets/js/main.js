console.log("MAIN.JS LOADED");

// =============================
// CENIT main.js
// - Hamburger menu toggle
// - Language switch (underline + store)
// =============================
(function () {

  // -----------------------------
  // MENU TOGGLE
  // -----------------------------
  const toggleBtn = document.querySelector(".cenit-menutoggle");
  const menu = document.querySelector(".cenit-menu");

  if (toggleBtn && menu) {
    const closeMenu = () => {
      menu.classList.remove("show");
      toggleBtn.setAttribute("aria-expanded", "false");
    };

    toggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = menu.classList.toggle("show");
      toggleBtn.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", (e) => {
      if (menu.contains(e.target) || toggleBtn.contains(e.target)) return;
      closeMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    toggleBtn.setAttribute("aria-controls", "cenit-menu");
    toggleBtn.setAttribute("aria-expanded", "false");
    if (!menu.id) menu.id = "cenit-menu";
  }

// LANGUAGE SWITCH (Topbar i18n + Page data-lang)
const buttons = document.querySelectorAll(".cenit-langbtn[data-set-lang]");

if (buttons.length) {
  const applyLang = (lang) => {
    const L = (lang === "en") ? "en" : "de";
    document.documentElement.lang = L;

    // 1) Topbar / UI via data-i18n
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (window.CENIT_I18N && window.CENIT_I18N[L]?.[key]) {
        el.textContent = window.CENIT_I18N[L][key];
      }
    });

    // 2) Page Content via data-lang
    document.querySelectorAll("[data-lang]").forEach((el) => {
      el.style.display = (el.getAttribute("data-lang") === L) ? "" : "none";
    });

    // underline
    buttons.forEach((b) =>
      b.classList.toggle("is-active", b.getAttribute("data-set-lang") === L)
    );

    try { localStorage.setItem("cenit-lang", L); } catch(_) {}
  };

  buttons.forEach((b) =>
    b.addEventListener("click", () => applyLang(b.getAttribute("data-set-lang")))
  );

  applyLang(localStorage.getItem("cenit-lang") || "de");
}
