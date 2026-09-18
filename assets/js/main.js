(function () {
  "use strict";

  /* Mobile navigation toggle */
  var navToggle = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Populate contact placeholders from central config */
  if (window.SITE_CONFIG) {
    var cfg = window.SITE_CONFIG;

    document.querySelectorAll('[data-contact="phone-href"]').forEach(function (el) {
      el.setAttribute("href", cfg.phone.href);
    });
    document.querySelectorAll('[data-contact="phone-display"]').forEach(function (el) {
      el.textContent = cfg.phone.display;
    });
    document.querySelectorAll('[data-contact="email-href"]').forEach(function (el) {
      el.setAttribute("href", cfg.email.href);
    });
    document.querySelectorAll('[data-contact="email-display"]').forEach(function (el) {
      el.textContent = cfg.email.display;
    });
    document.querySelectorAll('[data-contact="whatsapp-href"]').forEach(function (el) {
      var current = el.getAttribute("href") || "";
      var q = current.indexOf("?text=");
      el.setAttribute("href", cfg.whatsapp.base + (q > -1 ? current.slice(q) : ""));
    });
    document.querySelectorAll('[data-contact="whatsapp-display"]').forEach(function (el) {
      el.textContent = cfg.whatsapp.display;
    });
  }

  /* Language switcher dropdown */
  document.querySelectorAll(".lang-switcher").forEach(function (wrap) {
    var btn = wrap.querySelector(".lang-switcher-btn");
    var menu = wrap.querySelector(".lang-switcher-menu");
    if (!btn || !menu) return;

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var isOpen = !menu.hasAttribute("hidden");
      if (isOpen) {
        menu.setAttribute("hidden", "");
        btn.setAttribute("aria-expanded", "false");
      } else {
        menu.removeAttribute("hidden");
        btn.setAttribute("aria-expanded", "true");
      }
    });

    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target)) {
        menu.setAttribute("hidden", "");
        btn.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        menu.setAttribute("hidden", "");
        btn.setAttribute("aria-expanded", "false");
      }
    });
  });

  /* Quick-request form: builds a prefilled WhatsApp message, no backend needed */
  document.querySelectorAll("[data-whatsapp-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var number = form.getAttribute("data-whatsapp-number") || "";
      var nom = (form.querySelector('[name="nom"]') || {}).value || "";
      var tel = (form.querySelector('[name="telephone"]') || {}).value || "";
      var msg = (form.querySelector('[name="message"]') || {}).value || "";
      var lines = [
        "Bonjour, je souhaite une intervention.",
        "Nom : " + nom,
        "Téléphone : " + tel,
        "Situation : " + msg,
      ];
      var url = "https://wa.me/" + number + "?text=" + encodeURIComponent(lines.join("\n"));
      var statusEl = form.querySelector(".quick-form__status");
      if (statusEl) {
        statusEl.textContent = "Ouverture de WhatsApp avec votre message prérempli...";
      }
      window.open(url, "_blank", "noopener");
    });
  });

  /* Shared helpers: site base path, language, safe storage */
  var scriptEl = document.currentScript || document.querySelector('script[src$="assets/js/main.js"]');
  var base = scriptEl && scriptEl.src ? scriptEl.src.replace(/assets\/js\/main\.js.*$/, "") : "/";
  var isEn = (document.documentElement.getAttribute("lang") || "fr").indexOf("en") === 0;
  var CONSENT_KEY = "dpv-consent";
  var THEME_KEY = "dpv-theme";

  function store(kind) {
    try {
      return window[kind];
    } catch (e) {
      return null;
    }
  }

  function readKey(kind, key) {
    try {
      var s = store(kind);
      return s ? s.getItem(key) : null;
    } catch (e) {
      return null;
    }
  }

  function writeKey(kind, key, value) {
    try {
      var s = store(kind);
      if (s) s.setItem(key, value);
    } catch (e) {}
  }

  function removeKey(kind, key) {
    try {
      var s = store(kind);
      if (s) s.removeItem(key);
    } catch (e) {}
  }

  var TEXT = isEn
    ? {
        toDark: "Switch to dark mode",
        toLight: "Switch to light mode",
        cookieTitle: "Cookies and privacy",
        cookieText:
          "This site uses no advertising cookies and no analytics. You can only allow it to remember your theme preference (light or dark) on this device. Declining does not limit any feature.",
        more: "Privacy policy",
        refuse: "Decline",
        accept: "Accept",
        privacyUrl: base + "en/legal/privacy-policy.html",
      }
    : {
        toDark: "Passer en mode sombre",
        toLight: "Passer en mode clair",
        cookieTitle: "Cookies et vie privée",
        cookieText:
          "Ce site n'utilise aucun cookie publicitaire ni outil de mesure d'audience. Vous pouvez seulement l'autoriser à mémoriser votre préférence de thème (clair ou sombre) sur cet appareil. Refuser ne limite aucune fonctionnalité.",
        more: "Politique de confidentialité",
        refuse: "Refuser",
        accept: "Accepter",
        privacyUrl: base + "legal/politique-de-confidentialite.html",
      };

  /* Dark mode toggle */
  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0e1a3a" : "#2057db");
  }

  var headerCta = document.querySelector(".topbar__right") || document.querySelector(".header-cta");
  if (headerCta) {
    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "theme-toggle";
    toggle.innerHTML =
      '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>' +
      '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.07" y2="4.93"/></svg>';
    var syncToggleLabel = function () {
      toggle.setAttribute("aria-label", currentTheme() === "dark" ? TEXT.toLight : TEXT.toDark);
    };
    syncToggleLabel();
    toggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      applyTheme(next);
      if (readKey("localStorage", CONSENT_KEY) === "accepted") {
        writeKey("localStorage", THEME_KEY, next);
      } else {
        writeKey("sessionStorage", THEME_KEY, next);
      }
      syncToggleLabel();
    });
    headerCta.appendChild(toggle);
  }

  /* Cookie consent banner: nothing optional runs unless accepted */
  var banner = document.createElement("div");
  banner.className = "cookie-banner";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-labelledby", "cookie-title");
  banner.hidden = true;
  banner.innerHTML =
    '<h2 id="cookie-title">' + TEXT.cookieTitle + "</h2>" +
    "<p>" + TEXT.cookieText + ' <a href="' + TEXT.privacyUrl + '">' + TEXT.more + "</a></p>" +
    '<div class="cookie-banner__actions">' +
    '<button type="button" class="btn btn--outline" data-consent="refused">' + TEXT.refuse + "</button>" +
    '<button type="button" class="btn btn--outline" data-consent="accepted">' + TEXT.accept + "</button>" +
    "</div>";
  document.body.appendChild(banner);

  banner.querySelectorAll("[data-consent]").forEach(function (button) {
    button.addEventListener("click", function () {
      var choice = button.getAttribute("data-consent");
      writeKey("localStorage", CONSENT_KEY, choice);
      if (choice === "accepted") {
        var saved = readKey("sessionStorage", THEME_KEY);
        if (saved) writeKey("localStorage", THEME_KEY, saved);
      } else {
        var kept = readKey("localStorage", THEME_KEY);
        if (kept) writeKey("sessionStorage", THEME_KEY, kept);
        removeKey("localStorage", THEME_KEY);
      }
      banner.hidden = true;
    });
  });

  if (!readKey("localStorage", CONSENT_KEY)) {
    banner.hidden = false;
  }

  document.querySelectorAll("[data-cookie-settings]").forEach(function (link) {
    link.addEventListener("click", function () {
      banner.hidden = false;
      var first = banner.querySelector("button");
      if (first) first.focus();
    });
  });

  /* Footer year */
  var yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
