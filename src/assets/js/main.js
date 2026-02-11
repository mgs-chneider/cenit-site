console.log("CENIT main.js loaded");

/* =====================================================
   MENU TOGGLE
===================================================== */
const menuBtn = document.querySelector(".cenit-menutoggle");
const menu = document.querySelector(".cenit-menu");

if (menuBtn && menu) {
  menuBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const open = menu.classList.toggle("show");
    menuBtn.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
      menu.classList.remove("show");
      menuBtn.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      menu.classList.remove("show");
      menuBtn.setAttribute("aria-expanded", "false");
    }
  });
}

/* =====================================================
   LANGUAGE SWITCH + i18n
===================================================== */
const langButtons = document.querySelectorAll(".cenit-langbtn[data-set-lang]");

const dict = {
  de: {
    home: "Startseite",
    menuLabel: "Menü",
    vision: "Vision",
    about: "Über uns",
    expertise: "Expertise",
    insights: "Einblicke & Entwicklungen",
    faqs: "FAQs",
    contact: "Kontakt",
    statutes: "Satzung"
  },
  en: {
    home: "Home",
    menuLabel: "Menu",
    vision: "Vision",
    about: "About us",
    expertise: "Expertise",
    insights: "Insights & Updates",
    faqs: "FAQs",
    contact: "Contact",
    statutes: "Statutes"
  }
};

function applyLang(lang) {
  const L = dict[lang] ? lang : "de";
  document.documentElement.lang = L;

  // Content
  document.querySelectorAll("[data-lang]").forEach(el => {
    el.style.display = el.getAttribute("data-lang") === L ? "" : "none";
  });

  // UI labels
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[L][key]) el.textContent = dict[L][key];
  });

  // Button state
  langButtons.forEach(btn =>
    btn.classList.toggle("is-active", btn.dataset.setLang === L)
  );

  try { localStorage.setItem("cenit-lang", L); } catch(e){}
}

langButtons.forEach(btn =>
  btn.addEventListener("click", () => applyLang(btn.dataset.setLang))
);

// Init
let initialLang = "de";
try { initialLang = localStorage.getItem("cenit-lang") || "de"; } catch(e){}
applyLang(initialLang);

/* =====================================================
   SCROLL TO TOP
===================================================== */
const scrollBtn = document.getElementById("scrollTopBtn");

if (scrollBtn) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      scrollBtn.classList.add("show");
    } else {
      scrollBtn.classList.remove("show");
    }
  });

  scrollBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

<script>
document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".reveal");

  // Fallback: wenn IO nicht verfügbar, sofort anzeigen
  if (!("IntersectionObserver" in window)) {
    items.forEach(el => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target); // nur einmal animieren
      }
    });
  }, {
    root: null,
    threshold: 0.12,
    rootMargin: "0px 0px -10% 0px" // etwas früher “reinsliden”
  });

  items.forEach(el => observer.observe(el));
});
</script>
