console.log("MAIN.JS LOADED");

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

  
// ===== CENIT: Menu + Language (safe block) =====
(function () {
  // MENU
  const btn = document.querySelector(".cenit-menutoggle");
  const menu = document.querySelector(".cenit-menu");
  if (btn && menu) {
    const close = () => {
      menu.classList.remove("show");
      btn.setAttribute("aria-expanded", "false");
    };

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const willOpen = !menu.classList.contains("show");
      menu.classList.toggle("show", willOpen);
      btn.setAttribute("aria-expanded", String(willOpen));
    });

    document.addEventListener("click", (e) => {
      if (menu.contains(e.target) || btn.contains(e.target)) return;
      close();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });

    menu.addEventListener("click", (e) => e.stopPropagation());
  }

  // LANGUAGE (underline + store)
  const buttons = document.querySelectorAll(".cenit-langbtn[data-set-lang]");
  if (buttons.length) {
    const applyLang = (lang) => {
      const L = (lang === "en") ? "en" : "de";
      document.documentElement.setAttribute("lang", L);
      buttons.forEach((b) =>
        b.classList.toggle("is-active", b.getAttribute("data-set-lang") === L)
      );
      try { localStorage.setItem("cenit-lang", L); } catch (_) {}
    };

    buttons.forEach((b) =>
      b.addEventListener("click", () => applyLang(b.getAttribute("data-set-lang")))
    );

    let initial = "de";
    try { initial = localStorage.getItem("cenit-lang") || "de"; } catch (_) {}
    applyLang(initial);
  }
})();
