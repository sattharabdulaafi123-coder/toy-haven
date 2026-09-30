/* ==========================================================================
   Toy Haven - shared JavaScript (loaded on every page)
   Holds the reusable functions: storage, cart, wishlist, product cards,
   modals, toasts, form validation, navigation and scroll animations.
   ========================================================================== */

"use strict";

/* ---------- Constants ---------- */
const STORAGE_KEYS = {
  cart: "th_cart",
  wishlist: "th_wishlist",
  orders: "th_orders",
  feedback: "th_feedback",
  newsletter: "th_newsletter"
};

const SHIPPING_FEE = 450;
const FREE_SHIPPING_FROM = 10000;
const MAX_QTY = 10;

const WISHLIST_STATUSES = {
  interested: "Interested",
  owned: "Owned",
  "not-interested": "Not Interested"
};

/* Small inline SVG icons reused by JS-built markup */
const ICONS = {
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.6 4.5 7.1 4.5c2 0 3.6 1.1 4.9 2.8 1.3-1.7 2.9-2.8 4.9-2.8 3.5 0 5.7 3.5 4.4 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  check: '<svg class="check-circle" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29"/><path d="M19 33l9 9 17-19"/></svg>'
};

/* ---------- Storage helpers (reused on every page) ---------- */
function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    showToast("Your browser blocked saving data.", "error");
    return false;
  }
}

/* ---------- General helpers ---------- */
function formatPrice(amount) {
  return "Rs. " + Math.round(amount).toLocaleString("en-US");
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getProductById(id) {
  return PRODUCTS.find(function (product) {
    return product.id === id;
  });
}

function renderStars(rating) {
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
  return '<span aria-hidden="true">' + stars + '</span><span class="sr-only">Rated ' + rating + " out of 5</span>";
}

/* Image markup inside the wireframe-style placeholder box */
function mediaBox(src, alt, extraClass) {
  return '<span class="media ' + (extraClass || "") + '"><img src="' + src + '" alt="' + escapeHtml(alt) +
    '" width="600" height="600" loading="lazy"></span>';
}

/* ---------- Cart ---------- */
function getCart() {
  return loadData(STORAGE_KEYS.cart, []).filter(function (item) {
    return getProductById(item.id);
  });
}

function saveCart(cart) {
  saveData(STORAGE_KEYS.cart, cart);
  updateCartBadge(true);
}

function addToCart(productId, qty) {
  const product = getProductById(productId);
  if (!product) return;
  const cart = getCart();
  const existing = cart.find(function (item) {
    return item.id === productId;
  });
  if (existing) {
    if (existing.qty >= MAX_QTY) {
      showToast("Maximum of " + MAX_QTY + " per item.", "error");
      return;
    }
    existing.qty = Math.min(MAX_QTY, existing.qty + (qty || 1));
  } else {
    cart.push({ id: productId, qty: qty || 1 });
  }
  saveCart(cart);
  showToast(product.name + " added to cart", "success");
}

function setCartQty(productId, qty) {
  let cart = getCart();
  if (qty <= 0) {
    cart = cart.filter(function (item) {
      return item.id !== productId;
    });
  } else {
    cart.forEach(function (item) {
      if (item.id === productId) item.qty = Math.min(MAX_QTY, qty);
    });
  }
  saveCart(cart);
}

function clearCart() {
  saveCart([]);
}

/* Works out totals for any cart array (used by cart + checkout) */
function getCartTotals(cart) {
  const lines = cart.map(function (item) {
    const product = getProductById(item.id);
    return { product: product, qty: item.qty, lineTotal: product.price * item.qty };
  });
  const itemCount = lines.reduce(function (sum, line) {
    return sum + line.qty;
  }, 0);
  const subtotal = lines.reduce(function (sum, line) {
    return sum + line.lineTotal;
  }, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
  return { lines: lines, itemCount: itemCount, subtotal: subtotal, shipping: shipping, total: subtotal + shipping };
}

function updateCartBadge(animate) {
  const count = getCartTotals(getCart()).itemCount;
  document.querySelectorAll("[data-cart-count]").forEach(function (badge) {
    badge.textContent = count;
    if (animate) {
      badge.classList.remove("bump");
      void badge.offsetWidth; // restart the animation
      badge.classList.add("bump");
    }
  });
  document.querySelectorAll(".cart-link").forEach(function (link) {
    link.setAttribute("aria-label", "Shopping cart, " + count + (count === 1 ? " item" : " items"));
  });
}

/* ---------- Wishlist ---------- */
function getWishlist() {
  return loadData(STORAGE_KEYS.wishlist, []).filter(function (item) {
    return getProductById(item.id);
  });
}

function isInWishlist(productId) {
  return getWishlist().some(function (item) {
    return item.id === productId;
  });
}

function toggleWishlist(productId) {
  const product = getProductById(productId);
  let list = getWishlist();
  const added = !isInWishlist(productId);
  if (added) {
    list.push({ id: productId, status: "interested", added: new Date().toISOString() });
    showToast(product.name + " saved to wishlist", "success");
  } else {
    list = list.filter(function (item) {
      return item.id !== productId;
    });
    showToast(product.name + " removed from wishlist");
  }
  saveData(STORAGE_KEYS.wishlist, list);
  syncWishButtons(productId);
  return added;
}

/* Keeps every heart button for a product in the same state */
function syncWishButtons(productId) {
  const saved = isInWishlist(productId);
  document.querySelectorAll('[data-wish-id="' + productId + '"]').forEach(function (button) {
    button.setAttribute("aria-pressed", saved ? "true" : "false");
    const label = button.querySelector(".wish-label");
    if (label) label.textContent = saved ? "Saved to Wishlist" : "Add to Wishlist";
  });
}

/* ---------- Product card (used on Home and Products pages) ---------- */
function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card reveal";
  const saved = isInWishlist(product.id);
  card.innerHTML =
    '<button class="card-media" type="button" data-action="details" aria-label="View details for ' + escapeHtml(product.name) + '">' +
    mediaBox(product.image, product.name) +
    (product.isNew ? '<span class="badge">New</span>' : "") +
    "</button>" +
    '<div class="card-body">' +
    '<p class="card-category">' + product.category + "</p>" +
    '<h3 class="card-title">' + escapeHtml(product.name) + "</h3>" +
    '<p class="stars">' + renderStars(product.rating) + "</p>" +
    '<p class="card-price">' + formatPrice(product.price) + "</p>" +
    '<div class="card-actions">' +
    '<button class="btn btn-primary btn-sm" type="button" data-action="cart">Add to Cart</button>' +
    '<button class="icon-btn wish-btn" type="button" data-action="wish" data-wish-id="' + product.id + '" aria-pressed="' + saved +
    '" aria-label="Add ' + escapeHtml(product.name) + ' to wishlist">' + ICONS.heart + "</button>" +
    "</div></div>";

  card.addEventListener("click", function (event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    if (button.dataset.action === "cart") addToCart(product.id);
    if (button.dataset.action === "wish") toggleWishlist(product.id);
    if (button.dataset.action === "details") openProductModal(product);
  });
  return card;
}

/* ---------- Modals ---------- */
/* Builds a <dialog>, opens it and removes it again when closed */
function createModal(innerHtml, extraClass, labelId) {
  const dialog = document.createElement("dialog");
  dialog.className = "modal " + (extraClass || "");
  if (labelId) dialog.setAttribute("aria-labelledby", labelId);
  dialog.innerHTML =
    '<div class="modal-inner"><button class="icon-btn modal-close" type="button" aria-label="Close">' + ICONS.close + "</button>" +
    innerHtml + "</div>";
  document.body.appendChild(dialog);

  dialog.addEventListener("click", function (event) {
    // clicking the dark backdrop or the X closes the modal
    if (event.target === dialog || event.target.closest(".modal-close")) dialog.close("cancel");
  });
  dialog.addEventListener("close", function () {
    setTimeout(function () {
      dialog.remove();
    }, 50);
  });
  dialog.showModal();
  return dialog;
}

/* Promise-based confirm box, e.g. await showDialog({...}) */
function showDialog(options) {
  return new Promise(function (resolve) {
    const html =
      '<h2 id="dialog-title">' + options.title + "</h2>" +
      '<div class="dialog-body">' + options.html + "</div>" +
      '<div class="modal-actions">' +
      '<button class="btn btn-outline" type="button" data-result="cancel">' + (options.cancelText || "Cancel") + "</button>" +
      '<button class="btn ' + (options.confirmClass || "btn-primary") + '" type="button" data-result="ok">' + options.confirmText + "</button>" +
      "</div>";
    const dialog = createModal(html, "modal-small", "dialog-title");
    dialog.addEventListener("click", function (event) {
      const button = event.target.closest("[data-result]");
      if (button) dialog.close(button.dataset.result);
    });
    dialog.addEventListener("close", function () {
      resolve(dialog.returnValue === "ok");
    });
  });
}

function openProductModal(product) {
  const saved = isInWishlist(product.id);
  const html =
    '<div class="modal-product">' +
    mediaBox(product.image, product.name) +
    "<div>" +
    '<p class="card-category">' + product.category + "</p>" +
    '<h2 id="product-modal-title">' + escapeHtml(product.name) + "</h2>" +
    '<p class="stars">' + renderStars(product.rating) + "</p>" +
    '<p class="modal-price">' + formatPrice(product.price) + "</p>" +
    "<p>" + escapeHtml(product.description) + "</p>" +
    '<table class="spec-table"><caption class="sr-only">Product details</caption><tbody>' +
    '<tr><th scope="row">Category</th><td>' + product.category + "</td></tr>" +
    '<tr><th scope="row">Recommended age</th><td>' + product.age + "</td></tr>" +
    '<tr><th scope="row">Product code</th><td>' + product.id.toUpperCase() + "</td></tr>" +
    "</tbody></table>" +
    '<div class="modal-actions">' +
    '<button class="btn btn-primary" type="button" data-modal="cart">Add to Cart</button>' +
    '<button class="btn btn-outline wish-btn" type="button" data-modal="wish" data-wish-id="' + product.id + '" aria-pressed="' + saved + '">' +
    '<span class="wish-label">' + (saved ? "Saved to Wishlist" : "Add to Wishlist") + "</span></button>" +
    "</div></div></div>";

  const dialog = createModal(html, "", "product-modal-title");
  dialog.addEventListener("click", function (event) {
    const button = event.target.closest("[data-modal]");
    if (!button) return;
    if (button.dataset.modal === "cart") addToCart(product.id);
    if (button.dataset.modal === "wish") toggleWishlist(product.id);
  });
}

/* ---------- Toast notifications ---------- */
function showToast(message, type) {
  let stack = document.querySelector(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    stack.setAttribute("role", "status");
    stack.setAttribute("aria-live", "polite");
    document.body.appendChild(stack);
  }
  const toast = document.createElement("div");
  toast.className = "toast" + (type ? " is-" + type : "");
  toast.textContent = message;
  stack.appendChild(toast);
  setTimeout(function () {
    toast.classList.add("leaving");
    toast.addEventListener("animationend", function () {
      toast.remove();
    });
  }, 2800);
}

/* ---------- Form validation (used by newsletter, checkout, support) ---------- */
const validators = {
  name: function (value) {
    if (!value.trim()) return "Please enter your name.";
    if (!/^[A-Za-z][A-Za-z .'-]{2,49}$/.test(value.trim())) return "Name must be 3-50 letters (no numbers).";
    return "";
  },
  email: function (value) {
    if (!value.trim()) return "Please enter your email address.";
    if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(value.trim())) return "Please enter a valid email, e.g. name@example.com.";
    return "";
  },
  minLength: function (label, length) {
    return function (value) {
      if (!value.trim()) return "Please enter your " + label + ".";
      if (value.trim().length < length) return label.charAt(0).toUpperCase() + label.slice(1) + " must be at least " + length + " characters.";
      return "";
    };
  }
};

function setFieldError(input, message) {
  const errorEl = document.getElementById(input.id + "-error");
  if (message) {
    input.setAttribute("aria-invalid", "true");
  } else {
    input.removeAttribute("aria-invalid");
  }
  if (errorEl) errorEl.textContent = message;
}

/* rules = [{ input: element, check: function(value) -> "" or error text }] */
function validateFields(rules) {
  let firstInvalid = null;
  rules.forEach(function (rule) {
    const message = rule.check(rule.input.value);
    setFieldError(rule.input, message);
    if (message && !firstInvalid) firstInvalid = rule.input;
  });
  if (firstInvalid) {
    firstInvalid.focus();
    showToast("Please fix the highlighted fields.", "error");
  }
  return !firstInvalid;
}

/* Clears a field's error as soon as the user corrects it */
function liveValidate(input, check) {
  input.addEventListener("input", function () {
    if (input.getAttribute("aria-invalid") === "true") setFieldError(input, check(input.value));
  });
  input.addEventListener("blur", function () {
    if (input.value.trim()) setFieldError(input, check(input.value));
  });
}

/* ---------- Header navigation ---------- */
function initNavigation() {
  const toggle = document.querySelector(".hamburger");
  const nav = document.getElementById("main-nav");
  if (!toggle || !nav) return;

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("open", open);
  }

  toggle.addEventListener("click", function () {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });
  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && nav.classList.contains("open")) {
      setOpen(false);
      toggle.focus();
    }
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth >= 900) setOpen(false);
  });
}

/* ---------- Reveal-on-scroll animation ---------- */
const revealObserver = "IntersectionObserver" in window
  ? new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 })
  : null;

function watchReveal(root) {
  (root || document).querySelectorAll(".reveal:not(.in-view)").forEach(function (element, index) {
    element.style.transitionDelay = Math.min(index, 6) * 60 + "ms";
    if (revealObserver) {
      revealObserver.observe(element);
    } else {
      element.classList.add("in-view");
    }
  });
}

/* ---------- Newsletter (footer on every page) ---------- */
function initNewsletter() {
  const form = document.getElementById("newsletter-form");
  if (!form) return;
  const input = document.getElementById("newsletter-email");
  const message = document.getElementById("newsletter-msg");

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const error = validators.email(input.value);
    message.classList.remove("is-error", "is-success");
    if (error) {
      message.textContent = error;
      message.classList.add("is-error");
      input.focus();
      return;
    }
    const email = input.value.trim().toLowerCase();
    const subscribers = loadData(STORAGE_KEYS.newsletter, []);
    if (subscribers.some(function (entry) { return entry.email === email; })) {
      message.textContent = "You are already subscribed. Thank you!";
    } else {
      subscribers.push({ email: email, date: new Date().toISOString() });
      saveData(STORAGE_KEYS.newsletter, subscribers);
      message.textContent = "Subscribed! Watch your inbox for new arrivals.";
    }
    message.classList.add("is-success");
    form.reset();
  });
}

/* ---------- Page start-up ---------- */
document.addEventListener("DOMContentLoaded", function () {
  // hide broken images that failed before this script loaded
  document.querySelectorAll(".media img").forEach(function (img) {
    if (img.complete && img.naturalWidth === 0) img.classList.add("img-missing");
  });
  document.querySelectorAll("[data-year]").forEach(function (element) {
    element.textContent = new Date().getFullYear();
  });
  initNavigation();
  initNewsletter();
  updateCartBadge(false);
  watchReveal();
});

/* Register the service worker so the site works as a PWA */
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js").catch(function () {
      /* offline support is optional, so ignore failures */
    });
  });
}
