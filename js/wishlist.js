/* ==========================================================================
   Toy Haven - Wishlist / Collection page
   Saved items are tracked as Interested, Owned or Not Interested.
   ========================================================================== */

"use strict";

let activeStatus = "interested";

function saveWishlist(list) {
  saveData(STORAGE_KEYS.wishlist, list);
}

function renderWishlist() {
  const list = getWishlist();
  const grid = document.getElementById("wish-grid");
  const empty = document.getElementById("wish-empty");
  const items = list.filter(function (item) {
    return item.status === activeStatus;
  });

  // tab counters
  Object.keys(WISHLIST_STATUSES).forEach(function (status) {
    const total = list.filter(function (item) { return item.status === status; }).length;
    document.querySelector('[data-count="' + status + '"]').textContent = total;
  });

  grid.innerHTML = "";
  items.forEach(function (item) {
    const product = getProductById(item.id);
    const card = document.createElement("article");
    card.className = "product-card wish-card reveal";
    card.dataset.id = product.id;

    const options = Object.keys(WISHLIST_STATUSES).map(function (status) {
      return '<option value="' + status + '"' + (status === item.status ? " selected" : "") + ">" + WISHLIST_STATUSES[status] + "</option>";
    }).join("");

    card.innerHTML =
      '<button class="card-media" type="button" data-action="details" aria-label="View details for ' + escapeHtml(product.name) + '">' +
      mediaBox(product.image, product.name) +
      '<span class="status-tag" data-status="' + item.status + '">' + WISHLIST_STATUSES[item.status] + "</span>" +
      "</button>" +
      '<div class="card-body">' +
      '<p class="card-category">' + product.category + "</p>" +
      '<h3 class="card-title">' + escapeHtml(product.name) + "</h3>" +
      '<p class="card-price">' + formatPrice(product.price) + "</p>" +
      '<label class="sr-only" for="status-' + product.id + '">Status for ' + escapeHtml(product.name) + "</label>" +
      '<select class="status-select" id="status-' + product.id + '">' + options + "</select>" +
      '<div class="card-actions">' +
      '<button class="btn btn-primary btn-sm" type="button" data-action="cart">Add to Cart</button>' +
      '<button class="icon-btn remove-btn" type="button" data-action="remove" aria-label="Remove ' + escapeHtml(product.name) + ' from wishlist">' +
      ICONS.close + "</button>" +
      "</div></div>";
    grid.appendChild(card);
  });

  empty.hidden = items.length > 0;
  document.getElementById("wish-empty-text").textContent = list.length === 0
    ? "Your wishlist is empty. Tap the heart on any product to save it here."
    : "No items marked as “" + WISHLIST_STATUSES[activeStatus] + "” yet.";
  watchReveal(grid);
}

function initWishlist() {
  const tabs = document.querySelectorAll('[role="tab"]');
  const grid = document.getElementById("wish-grid");
  const panel = document.getElementById("wish-panel");

  function selectTab(tab) {
    activeStatus = tab.dataset.status;
    tabs.forEach(function (other) {
      const selected = other === tab;
      other.setAttribute("aria-selected", selected ? "true" : "false");
      other.tabIndex = selected ? 0 : -1;
    });
    panel.setAttribute("aria-labelledby", tab.id);
    renderWishlist();
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () {
      selectTab(tab);
    });
    // arrow keys move between tabs
    tab.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      const next = tabs[(index + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      next.focus();
      selectTab(next);
    });
  });

  // status dropdown changes
  grid.addEventListener("change", function (event) {
    if (!event.target.matches(".status-select")) return;
    const id = event.target.closest(".wish-card").dataset.id;
    const list = getWishlist();
    list.forEach(function (item) {
      if (item.id === id) item.status = event.target.value;
    });
    saveWishlist(list);
    showToast(getProductById(id).name + " marked as " + WISHLIST_STATUSES[event.target.value], "success");
    renderWishlist();
  });

  grid.addEventListener("click", async function (event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const id = button.closest(".wish-card").dataset.id;
    const product = getProductById(id);

    if (button.dataset.action === "cart") addToCart(id);
    if (button.dataset.action === "details") openProductModal(product);
    if (button.dataset.action === "remove") {
      const confirmed = await showDialog({
        title: "Remove from wishlist?",
        html: "<p>" + escapeHtml(product.name) + " will be removed from your collection.</p>",
        confirmText: "Remove",
        confirmClass: "btn-dark"
      });
      if (confirmed) {
        saveWishlist(getWishlist().filter(function (item) { return item.id !== id; }));
        showToast(product.name + " removed from wishlist");
        renderWishlist();
      }
    }
  });

  // if the modal's wishlist button is used, refresh the list afterwards
  document.addEventListener("close", function () {
    renderWishlist();
  }, true);

  renderWishlist();
}

document.addEventListener("DOMContentLoaded", initWishlist);
