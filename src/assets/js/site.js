<script>
  window.__cenitNavLoaded = true;
  console.log("CENIT nav loaded");

  // ===== Dropdown menu =====
  (function () {
    const btn = document.querySelector(".cenit-menutoggle");
    const menu = document.querySelector(".cenit-menu");
    if (!btn || !menu) return;

    const close = () => {
      menu.classList.remove("show");
      btn.setAttribute("aria-expanded", "false");
    };

    btn.addEventListener("click", (e) => {
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
  })();

  // ===== Language switch (data-lang blocks) =====
  (function () {
    const buttons = document.querySelectorAll(".cenit-langbtn[data-set-lang]");
    if (!buttons.length) return;

    const applyLang = (lang) => {
      document.documentElement.lang = lang;

      document.querySelectorAll("[data-lang]").forEach((el) => {
        el.style.display = (el.getAttribute("data-lang") === lang) ? "" : "none";
      });

      buttons.forEach((b) => b.classList.toggle("is-active", b.dataset.setLang === lang));

      try { localStorage.setItem("cenit_lang", lang); } catch(e) {}
    };

    buttons.forEach((btn) => btn.addEventListener("click", () => applyLang(btn.dataset.setLang)));

    let initial = "de";
    try { initial = localStorage.getItem("cenit_lang") || initial; } catch(e) {}
    initial = document.documentElement.lang || initial;
    applyLang(initial);
  })();
</script>
