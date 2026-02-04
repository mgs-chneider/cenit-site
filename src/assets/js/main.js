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

  // -----------------------------
  // LANGUAGE SWITCH (underline only)
  // -----------------------------
  const langButtons = document.querySelectorAll(".cenit-langbtn[data-set-lang]");

  if (langButtons.length) {
    const applyLang = (lang) => {
      const L = (lang === "en") ? "en" : "de";
      document.documentElement.setAttribute("lang", L);

      langButtons.forEach((btn) =>
        btn.classList.toggle(
          "is-active",
          btn.getAttribute("data-set-lang") === L
        )
      );

      try {
        localStorage.setItem("cenit-lang", L);
      } catch (_) {}
    };

    langButtons.forEach((btn) =>
      btn.addEventListener("click", () =>
        applyLang(btn.getAttribute("data-set-lang"))
      )
    );

    let initial = "de";
    try {
      initial = localStorage.getItem("cenit-lang") || "de";
    } catch (_) {}

    applyLang(initial);
  }

})();

