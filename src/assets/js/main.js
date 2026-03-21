console.log("CENIT main.js loaded");

/* =====================================================
   DOM READY WRAPPER
===================================================== */
document.addEventListener("DOMContentLoaded", () => {

   const topbar = document.querySelector(".cenit-topbar");
if (topbar) {
  const onScroll = () => {
    topbar.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}
   
  /* =====================================================
     MENU TOGGLE
  ===================================================== */
 const menuBtn = document.querySelector(".cenit-menutoggle");
const menu = document.querySelector(".cenit-menu");

if (menuBtn && menu) {
  const closeMenu = () => {
    menu.classList.remove("show");
    menuBtn.setAttribute("aria-expanded", "false");
  };

  const toggleMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const open = menu.classList.toggle("show");
    menuBtn.setAttribute("aria-expanded", String(open));
  };

  menuBtn.addEventListener("click", toggleMenu);

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // Close after clicking any menu item (anchors + pages)
  menu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => closeMenu());
  });
}

  /* =====================================================
     LANGUAGE SWITCH + i18n
  ===================================================== */

  const langButtons = document.querySelectorAll(".cenit-langbtn[data-set-lang]");

  const dict = {
    de: {
      home: "Home",
      menuLabel: "Menü",
      vision: "Vision & Mission",
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
      vision: "Vision & Mission",
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

    // Content Switch
    document.querySelectorAll("[data-lang]").forEach(el => {
      el.style.display = el.getAttribute("data-lang") === L ? "" : "none";
    });

    // UI Labels
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (dict[L] && dict[L][key]) {
        el.textContent = dict[L][key];
      }
    });

   // Button Active State
   langButtons.forEach(btn => {
     btn.classList.toggle("is-active", btn.dataset.setLang === L);
   });

   try {
     localStorage.setItem("cenit-lang", L);
   } catch(e){}
   }

   const routeMap = {
     "/de/impressum/": "/en/legal-notice/",
     "/en/legal-notice/": "/de/impressum/",
     "/de/datenschutz/": "/en/privacy/",
     "/en/privacy/": "/de/datenschutz/"
   };

   langButtons.forEach(btn => {
     btn.addEventListener("click", () => {
       const targetLang = btn.dataset.setLang;
       const path = window.location.pathname;

       // zuerst Spezialfälle mit unterschiedlichen Slugs
       if (routeMap[path]) {
         try {
           localStorage.setItem("cenit-lang", targetLang);
         } catch(e){}
         window.location.href = routeMap[path];
         return;
       }

       // generischer Wechsel für /de/... und /en/...
       let newPath = path;

       if (targetLang === "en" && path.startsWith("/de/")) {
         newPath = path.replace(/^\/de\//, "/en/");
       } else if (targetLang === "de" && path.startsWith("/en/")) {
         newPath = path.replace(/^\/en\//, "/de/");
       }

       if (newPath !== path) {
         try {
         localStorage.setItem("cenit-lang", targetLang);
         } catch(e){}
         window.location.href = newPath;
         return;
       }

       // Fallback für Seiten ohne /de/ oder /en/
       applyLang(targetLang);
     });
   });

  let initialLang = "de";
  try {
    initialLang = localStorage.getItem("cenit-lang") || "de";
  } catch(e){}

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


  /* =====================================================
     SCROLL REVEAL (IntersectionObserver)
  ===================================================== */

  const revealItems = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach(el => el.classList.add("is-visible"));
  } else {

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: "0px 0px -10% 0px"
    });

    revealItems.forEach(el => observer.observe(el));
  }

});

  /* =====================================================
     MENU OVERVIEW LINK
  ===================================================== */

const overviewLink = document.querySelector(".cenit-menu-home");

if (overviewLink) {
  overviewLink.addEventListener("click", (e) => {
    if (document.body.classList.contains("page-home")) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  });
}

/* =====================================================
     INFOGRAM EMBED
  ===================================================== */

function loadInfogramEmbed(button) {
  const box = button.closest(".cenit-embed-consent-box");
  if (!box) return;

  const src = box.getAttribute("data-embed-src");
  const height = box.getAttribute("data-embed-height") || "560";

  if (!src) return;

  const iframe = document.createElement("iframe");
  iframe.className = "cenit-embed";
  iframe.src = src;
  iframe.width = "100%";
  iframe.height = height;
  iframe.setAttribute("loading", "lazy");
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("scrolling", "no");
  iframe.setAttribute("allowfullscreen", "allowfullscreen");
  iframe.setAttribute("title", "Infogram chart");

  box.replaceWith(iframe);
}
