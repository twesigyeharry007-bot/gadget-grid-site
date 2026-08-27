/* ==========================================================================
   The Gadget Grid — Cart (localStorage-backed, shared across pages)
   ========================================================================== */

const CART_KEY = "gadgetgrid_cart_v1";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product, qty = 1) {
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || PLACEHOLDER_IMG,
      qty
    });
  }
  saveCart(cart);
}

function updateQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  const next = cart.filter(i => i.qty > 0);
  saveCart(next);
  renderCartDrawer();
}

function removeFromCart(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  renderCartDrawer();
}

function clearCart() {
  saveCart([]);
  renderCartDrawer();
}

function cartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

function cartTotal() {
  return getCart().reduce((sum, i) => sum + i.qty * i.price, 0);
}

function updateCartBadge() {
  document.querySelectorAll(".cart-badge").forEach(el => {
    const count = cartCount();
    el.textContent = count;
    el.style.display = count > 0 ? "flex" : "none";
  });
  updateMobileCartBar();
}

// ---- Sticky mobile cart bar (present on every page except checkout itself,
// mobile widths only — see .mobile-cart-bar.show in style.css) ------------
function ensureMobileCartBar() {
  const existing = document.getElementById("mobileCartBar");
  if (existing) return existing;
  if (document.getElementById("checkoutContent")) return null; // don't show it on the checkout page itself
  const bar = document.createElement("button");
  bar.id = "mobileCartBar";
  bar.className = "mobile-cart-bar";
  bar.type = "button";
  bar.innerHTML = `
    <span class="mcb-icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
    </span>
    <span class="mcb-text"><span id="mcbCount">0 items</span> · <span id="mcbTotal">UGX 0</span></span>
    <span class="mcb-cta">View Cart</span>`;
  bar.addEventListener("click", () => { if (typeof openCart === "function") openCart(); });
  document.body.appendChild(bar);
  return bar;
}

function updateMobileCartBar() {
  if (document.readyState === "loading") return; // body not ready yet
  const bar = ensureMobileCartBar();
  if (!bar) return; // suppressed on the checkout page
  const count = cartCount();
  const countEl = document.getElementById("mcbCount");
  const totalEl = document.getElementById("mcbTotal");
  if (countEl) countEl.textContent = count + (count === 1 ? " item" : " items");
  if (totalEl) totalEl.textContent = formatPrice(cartTotal());
  bar.classList.toggle("show", count > 0);
}

// ---- Cart drawer UI (present on every page) --------------------------------
function renderCartDrawer() {
  const itemsEl = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  if (!itemsEl) return;

  const cart = getCart();
  if (!cart.length) {
    itemsEl.innerHTML = `<div class="empty-state">Your cart is empty.<br>Browse the shop to add some gadgets.</div>`;
  } else {
    itemsEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <div class="name">${item.name}</div>
          <div class="meta">${formatPrice(item.price)} each</div>
          <div class="qty-row">
            <button class="qty-btn" onclick="updateQty('${item.id}', -1)">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
            <span class="remove-link" onclick="removeFromCart('${item.id}')">Remove</span>
          </div>
        </div>
      </div>
    `).join("");
  }
  if (totalEl) totalEl.textContent = formatPrice(cartTotal());
  updateCartBadge();
}

function openCart() {
  document.getElementById("cartDrawer")?.classList.add("open");
  document.getElementById("cartOverlay")?.classList.add("open");
  renderCartDrawer();
}
function closeCart() {
  document.getElementById("cartDrawer")?.classList.remove("open");
  document.getElementById("cartOverlay")?.classList.remove("open");
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

document.addEventListener("DOMContentLoaded", updateCartBadge);
