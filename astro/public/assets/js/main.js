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
     Removed for the Astro build: language is now a real route
     (/ vs /en/...) set server-side by Layout.astro, not a client-side
     toggle. The old localStorage-driven toggle used to clobber
     document.documentElement.lang on every page load regardless of
     the actual route - see project memory for details.
  ===================================================== */
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
    revealItems.forEach(el => {
      observer.observe(el);
      // Sicherheitsnetz: Auf Seiten wie den Einblicke/Radar-Artikeln liegt der
      // gesamte Inhalt in einem einzigen, sehr großen .reveal-Wrapper. Löst der
      // IntersectionObserver aus irgendeinem Grund nie aus (z. B. Tab im
      // Hintergrund geöffnet, iOS Stromsparmodus, sehr große Zielgröße),
      // bleibt die komplette Seite sonst dauerhaft unsichtbar ("blank").
      // Nach spätestens 1.5s wird der Inhalt daher in jedem Fall eingeblendet.
      setTimeout(() => {
        if (!el.classList.contains("is-visible")) {
          el.classList.add("is-visible");
        }
      }, 1500);
    });
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

// Lädt alle noch nicht geladenen Infogram-Grafiken der aktuell sichtbaren
// Sprachversion automatisch (wird von Klaro aufgerufen, sobald der
// "infogram"-Service zugestimmt wurde).
function autoLoadAllInfogramEmbeds() {
  document.querySelectorAll(".cenit-embed-consent-box[data-embed-src]").forEach((box) => {
    const wrapper = box.closest("[data-lang]");
    if (wrapper && wrapper.style.display === "none") return;
    const btn = box.querySelector(".cenit-embed-consent-btn");
    if (btn) loadInfogramEmbed(btn);
  });
}

// Auto-Load bei bereits gespeicherter Einwilligung übernimmt consent.js
// (siehe applyConsent() dort), das nach DOMContentLoaded ausgeführt wird.
