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
