(function () {
  const i18n = {
    de: {
      menuLabel:"Menü",
      vision:"Vision",
      about:"Über uns",
      expertise:"Expertise",
      insights:"Einblicke & Entwicklungen",
      faqs:"FAQs",
      contact:"Kontakt",
      statutes:"Satzung"
    },
    en: {
      menuLabel:"Menu",
      vision:"Vision",
      about:"About",
      expertise:"Expertise",
      insights:"Insights & Updates",
      faqs:"FAQs",
      contact:"Contact",
      statutes:"Statutes"
    }
  };

  function getLang(){
    const stored = localStorage.getItem("cenit_lang");
    return (stored === "en" || stored === "de") ? stored : "de";
  }

  function applyLang(lang){
    document.documentElement.lang = lang;

    // Active state on DE/EN
    document.querySelectorAll(".cenit-langbtn").forEach(btn=>{
      btn.classList.toggle("is-active", btn.getAttribute("data-set-lang") === lang);
    });

    // Translate menu labels (data-i18n)
    document.querySelectorAll("[data-i18n]").forEach(el=>{
      const key = el.getAttribute("data-i18n");
      if (i18n[lang] && i18n[lang][key]) el.textContent = i18n[lang][key];
    });

    // Switch content blocks (data-lang) with correct display type
    document.querySelectorAll("[data-lang]").forEach(el => {
      const isActive = el.getAttribute("data-lang") === lang;
      if (!isActive) { el.style.display = "none"; return; }

      const tag = el.tagName.toLowerCase();
      if (tag === "span" || tag === "strong" || tag === "em") el.style.display = "inline";
      else if (tag === "a" || tag === "button") el.style.display = "inline-block";
      else el.style.display = "block";
    });
  }

  // Expose sound function for hero buttons
  window.unmuteVideo = function unmuteVideo() {
    const iframe = document.getElementById("promoVideo");
    const btnDe  = document.getElementById("soundButton");
    const btnEn  = document.getElementById("soundButtonEn");
    if (!iframe) return;

    iframe.src = "https://www.youtube.com/embed/kSqYtMHOwPg?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0&showinfo=0";
    if (btnDe) btnDe.style.display = "none";
    if (btnEn) btnEn.style.display = "none";
  };

  // Menu toggle
  function initMenu(){
    const toggle = document.querySelector(".cenit-menutoggle");
    const menu   = document.querySelector(".cenit-menu");
    if (!toggle || !menu) return;

    toggle.addEventListener("click",(e)=>{
      e.stopPropagation();
      const isOpen = menu.classList.toggle("show");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    document.addEventListener("click",(e)=>{
      if (!menu.contains(e.target) && !toggle.contains(e.target)){
        menu.classList.remove("show");
        toggle.setAttribute("aria-expanded","false");
      }
    });

    menu.querySelectorAll("a").forEach(a=>{
      a.addEventListener("click",()=>{
        menu.classList.remove("show");
        toggle.setAttribute("aria-expanded","false");
      });
    });
  }

  function initLangButtons(){
    document.querySelectorAll(".cenit-langbtn").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const lang = btn.getAttribute("data-set-lang");
        localStorage.setItem("cenit_lang", lang);
        applyLang(getLang());
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyLang(getLang());
    initLangButtons();
    initMenu();
  });

})();

