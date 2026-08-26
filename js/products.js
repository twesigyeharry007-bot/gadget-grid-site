/* ==========================================================================
   The Gadget Grid — Product Data Layer
   - Loads live products from the Google Sheet configured in js/config.js
   - Falls back to the sample catalog below if no sheet is configured yet,
     or if the sheet can't be reached (e.g. offline preview).
   ========================================================================== */

// ---- Sample / fallback catalog ------------------------------------------
// NOTE: Prices below are PLACEHOLDERS. Replace with real prices (or better,
// manage them from your Google Sheet — see README.md).
const FALLBACK_PRODUCTS = [
  {
    id: "camon-blue",
    name: "Tecno Camon (Slim Series) — Wave Blue",
    category: "Phones",
    price: 799000,
    oldPrice: 899000,
    image: "assets/tecno-camon-blue.png",
    description: "Ultra-slim design, dual rear camera with ring flash, smooth AMOLED curved display. Wave Blue finish.",
    stock: "yes",
    featured: "yes"
  },
  {
    id: "camon-white",
    name: "Tecno Camon (Slim Series) — Studio White",
    category: "Phones",
    price: 799000,
    oldPrice: "",
    image: "assets/tecno-camon-white.png",
    description: "Ultra-slim design, dual rear camera with ring flash, smooth AMOLED curved display. Studio White finish.",
    stock: "yes",
    featured: "yes"
  },
  {
    id: "sample-earbuds",
    name: "Wireless Bluetooth Earbuds Pro",
    category: "Audio",
    price: 89000,
    oldPrice: 120000,
    image: "",
    description: "Noise-isolating wireless earbuds with 24h charging case and touch controls.",
    stock: "yes",
    featured: "yes"
  },
  {
    id: "sample-powerbank",
    name: "20,000mAh Fast-Charge Power Bank",
    category: "Accessories",
    price: 95000,
    oldPrice: "",
    image: "",
    description: "Dual USB output, fast charging support, slim portable design for all-day power on the go.",
    stock: "yes",
    featured: "no"
  },
  {
    id: "sample-watch",
    name: "Smart Watch Fitness Edition",
    category: "Wearables",
    price: 130000,
    oldPrice: 160000,
    image: "",
    description: "Heart-rate monitoring, call notifications, multiple sport modes, 7-day battery life.",
    stock: "yes",
    featured: "yes"
  },
  {
    id: "sample-charger",
    name: "65W Fast Charger + Type-C Cable",
    category: "Accessories",
    price: 45000,
    oldPrice: "",
    image: "",
    description: "Compact GaN fast charger, compatible with most Android phones and laptops.",
    stock: "yes",
    featured: "no"
  },
  {
    id: "sample-case",
    name: "Shockproof Clear Phone Case",
    category: "Accessories",
    price: 25000,
    oldPrice: "",
    image: "",
    description: "Slim-fit protective case with reinforced corners, fits most popular phone models.",
    stock: "no",
    featured: "no"
  },
  {
    id: "sample-speaker",
    name: "Portable Bluetooth Speaker",
    category: "Audio",
    price: 110000,
    oldPrice: "",
    image: "",
    description: "Rich bass, water-resistant build, up to 12 hours of playtime on a single charge.",
    stock: "yes",
    featured: "no"
  }
];

// A tiny inline "no image" placeholder (keeps the grid tidy for sample rows
// that don't have a real product photo yet).
const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
    <rect width="300" height="300" fill="#f6f8fc"/>
    <circle cx="150" cy="120" r="46" fill="none" stroke="#c7d3e6" stroke-width="6"/>
    <path d="M70 230 L120 160 L160 200 L200 150 L240 230 Z" fill="none" stroke="#c7d3e6" stroke-width="6" stroke-linejoin="round"/>
  </svg>`);

// ---- CSV parsing (handles quoted commas) ---------------------------------
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ""; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c === '\r') { /* skip */ }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => r.some(cell => cell.trim() !== ""));
}

function rowsToProducts(rows) {
  if (!rows.length) return [];
  const headers = rows[0].map(h => h.trim().toLowerCase());
  return rows.slice(1).map((r, idx) => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (r[i] || "").trim(); });
    return {
      id: obj.id || `sheet-${idx}`,
      name: obj.name || "Unnamed product",
      category: obj.category || "Other",
      price: Number(String(obj.price).replace(/[^0-9.]/g, "")) || 0,
      oldPrice: obj.oldprice ? Number(String(obj.oldprice).replace(/[^0-9.]/g, "")) : "",
      image: obj.image || "",
      description: obj.description || "",
      stock: (obj.stock || "yes").toLowerCase(),
      featured: (obj.featured || "no").toLowerCase()
    };
  });
}

// ---- Public loader ---------------------------------------------------------
async function loadProducts() {
  const url = (typeof SITE_CONFIG !== "undefined" && SITE_CONFIG.sheetCsvUrl) || "";
  if (url) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Sheet fetch failed: " + res.status);
      const text = await res.text();
      const products = rowsToProducts(parseCsv(text));
      if (products.length) return products;
    } catch (err) {
      console.warn("Could not load Google Sheet catalog, using sample products instead.", err);
    }
  }
  return FALLBACK_PRODUCTS;
}

function formatPrice(n) {
  const currency = (typeof SITE_CONFIG !== "undefined" && SITE_CONFIG.currency) || "UGX";
  if (!n && n !== 0) return "";
  return currency + " " + Number(n).toLocaleString("en-UG");
}

// ---- Shared product registry + card renderer (used by index.html + shop.html) --------
// Keyed lookup so card buttons only need a product id (no HTML-escaping of JSON needed).
const PRODUCT_MAP = {};
function registerProducts(list) {
  list.forEach(p => { PRODUCT_MAP[p.id] = p; });
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function productCardHTML(p) {
  const img = p.image || PLACEHOLDER_IMG;
  const outOfStock = p.stock === "no";
  return `
    <div class="card">
      <div class="card-media">
        ${outOfStock ? '<span class="badge out">Out of Stock</span>' : (p.oldPrice ? '<span class="badge">Sale</span>' : '')}
        <img src="${img}" alt="${escapeHTML(p.name)}" loading="lazy">
      </div>
      <div class="card-body">
        <div class="card-cat">${escapeHTML(p.category)}</div>
        <div class="card-title">${escapeHTML(p.name)}</div>
        <div class="card-desc">${escapeHTML(p.description || "")}</div>
        <div class="card-foot">
          <div class="price">${p.oldPrice ? `<span class="old">${formatPrice(p.oldPrice)}</span>` : ""}${formatPrice(p.price)}</div>
          <button class="btn btn-primary btn-sm" ${outOfStock ? "disabled" : ""} onclick="addProductById('${p.id}')">
            ${outOfStock ? "Unavailable" : "Add"}
          </button>
        </div>
      </div>
    </div>`;
}

function addProductById(id) {
  const p = PRODUCT_MAP[id];
  if (!p) return;
  addToCart(p);
  showToast("Added to cart");
}
