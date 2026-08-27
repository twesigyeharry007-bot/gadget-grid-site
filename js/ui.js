/* ==========================================================================
   The Gadget Grid — Shared UI wiring (nav toggle, footer year, contact links,
   floating WhatsApp button, product quick-view modal)
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

  injectWhatsappFab();
  injectQuickViewModal();
});

// ---- Floating WhatsApp button (present on every page) ----------------------
function injectWhatsappFab() {
  if (document.getElementById("waFab") || typeof SITE_CONFIG === "undefined") return;
  const msg = encodeURIComponent("Hi! I have a question about a product on The Gadget Grid.");
  const a = document.createElement("a");
  a.id = "waFab";
  a.className = "whatsapp-fab";
  a.href = `https://wa.me/${SITE_CONFIG.whatsapp}?text=${msg}`;
  a.target = "_blank";
  a.rel = "noopener";
  a.setAttribute("aria-label", "Chat with us on WhatsApp");
  a.innerHTML = `<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.48 1.32 5L2 22l5.24-1.38a9.9 9.9 0 0 0 4.8 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.87 9.87 0 0 0 12.04 2m0 1.67a8.23 8.23 0 0 1 8.23 8.24c0 4.54-3.7 8.23-8.24 8.23a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.11.82.83-3.03-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.72 11.02c-.09-.15-.33-.24-.68-.42-.36-.18-2.1-1.04-2.42-1.16-.33-.12-.57-.18-.8.18-.24.36-.92 1.16-1.13 1.4-.21.24-.42.27-.77.09-.36-.18-1.5-.56-2.86-1.78-1.06-.94-1.77-2.11-1.98-2.47-.21-.36-.02-.55.16-.73.16-.16.36-.42.55-.63.18-.21.24-.36.36-.6.12-.24.06-.45-.03-.63-.09-.18-.8-1.94-1.1-2.66-.29-.7-.58-.6-.8-.61-.21-.01-.45-.01-.69-.01-.24 0-.63.09-.96.45-.33.36-1.26 1.23-1.26 3s1.29 3.48 1.47 3.72c.18.24 2.54 3.88 6.16 5.44.86.37 1.53.6 2.05.76.86.27 1.65.24 2.27.14.69-.1 2.1-.86 2.4-1.69.3-.83.3-1.54.21-1.69z"/></svg>`;
  document.body.appendChild(a);
}

// ---- Product quick-view modal (present on every page) ----------------------
function injectQuickViewModal() {
  if (document.getElementById("quickviewModal")) return;

  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.id = "quickviewOverlay";

  const modal = document.createElement("div");
  modal.className = "quickview-modal";
  modal.id = "quickviewModal";
  modal.innerHTML = `<button class="quickview-close" id="quickviewClose" aria-label="Close">&times;</button>
    <div id="quickviewBody"></div>`;

  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  overlay.addEventListener("click", closeQuickView);
  document.getElementById("quickviewClose").addEventListener("click", closeQuickView);
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeQuickView(); });
}

function openQuickView(id) {
  const p = (typeof PRODUCT_MAP !== "undefined") && PRODUCT_MAP[id];
  if (!p) return;
  const img = p.image || (typeof PLACEHOLDER_IMG !== "undefined" ? PLACEHOLDER_IMG : "");
  const outOfStock = p.stock === "no";
  const waMsg = encodeURIComponent(`Hi! I'm interested in the ${p.name} (${formatPrice(p.price)}) from The Gadget Grid.`);
  const waHref = (typeof SITE_CONFIG !== "undefined") ? `https://wa.me/${SITE_CONFIG.whatsapp}?text=${waMsg}` : "#";

  document.getElementById("quickviewBody").innerHTML = `
    <div class="quickview-media">
      ${outOfStock ? '<span class="badge out">Out of Stock</span>' : (p.oldPrice ? '<span class="badge">Sale</span>' : '')}
      <img src="${img}" alt="${escapeHTML(p.name)}">
    </div>
    <div class="quickview-info">
      <div class="card-cat">${escapeHTML(p.category)}</div>
      <h3>${escapeHTML(p.name)}</h3>
      <p class="quickview-desc">${escapeHTML(p.description || "")}</p>
      <div class="price" style="font-size:22px;">${p.oldPrice ? `<span class="old">${formatPrice(p.oldPrice)}</span>` : ""}${formatPrice(p.price)}</div>
      <div class="quickview-actions">
        <button class="btn btn-primary" ${outOfStock ? "disabled" : ""} onclick="addProductById('${p.id}'); closeQuickView();">
          ${outOfStock ? "Unavailable" : "Add to Cart"}
        </button>
        <a class="btn btn-outline" href="${waHref}" target="_blank" rel="noopener">Ask on WhatsApp</a>
      </div>
    </div>`;

  document.getElementById("quickviewOverlay").classList.add("open");
  document.getElementById("quickviewModal").classList.add("open");
}

function closeQuickView() {
  document.getElementById("quickviewOverlay")?.classList.remove("open");
  document.getElementById("quickviewModal")?.classList.remove("open");
}
