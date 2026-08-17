/* ==========================================================================
   The Gadget Grid — Shared UI wiring (nav toggle, footer year, contact links)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Mobile nav toggle
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", () => links.classList.toggle("open"));
    links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => links.classList.remove("open")));
  }

  // Cart drawer wiring
  document.getElementById("cartOpenBtn")?.addEventListener("click", openCart);
  document.getElementById("cartCloseBtn")?.addEventListener("click", closeCart);
  document.getElementById("cartOverlay")?.addEventListener("click", closeCart);

  // Populate business info from config wherever data-config attributes exist
  if (typeof SITE_CONFIG !== "undefined") {
    document.querySelectorAll("[data-config]").forEach(el => {
      const key = el.getAttribute("data-config");
      if (SITE_CONFIG[key] !== undefined) el.textContent = SITE_CONFIG[key];
    });
    document.querySelectorAll("[data-config-href]").forEach(el => {
      const key = el.getAttribute("data-config-href");
      if (SITE_CONFIG[key] !== undefined) el.setAttribute("href", SITE_CONFIG[key]);
    });
    const waLinks = document.querySelectorAll("[data-whatsapp-link]");
    waLinks.forEach(el => {
      el.setAttribute("href", `https://wa.me/${SITE_CONFIG.whatsapp}`);
    });
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }
});
