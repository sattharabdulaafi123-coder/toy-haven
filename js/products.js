/* ==========================================================================
   Toy Haven - Product listing page
   Search by name, filter by category + price, sort, and render cards.
   ========================================================================== */

"use strict";

const shopState = {
  query: "",
  categories: new Set(),
  prices: new Set(),
  sort: "featured"
};

function getFilteredProducts() {
  const query = shopState.query.trim().toLowerCase();

  const results = PRODUCTS.filter(function (product) {
    const matchesQuery = !query || product.name.toLowerCase().includes(query);
    const matchesCategory = shopState.categories.size === 0 || shopState.categories.has(product.category);
    const matchesPrice = shopState.prices.size === 0 || Array.from(shopState.prices).some(function (key) {
      const range = PRICE_RANGES[key];
      return product.price >= range.min && product.price <= range.max;
    });
    return matchesQuery && matchesCategory && matchesPrice;
  });

  const sorters = {
    featured: function (a, b) { return Number(b.featured) - Number(a.featured); },
    "price-asc": function (a, b) { return a.price - b.price; },
    "price-desc": function (a, b) { return b.price - a.price; },
    name: function (a, b) { return a.name.localeCompare(b.name); }
  };
  return results.sort(sorters[shopState.sort]);
}

function renderProducts() {
  const grid = document.getElementById("product-grid");
  const empty = document.getElementById("no-results");
  const count = document.getElementById("results-count");
  const results = getFilteredProducts();

  grid.innerHTML = "";
  results.forEach(function (product) {
    grid.appendChild(createProductCard(product));
  });
  watchReveal(grid);

  empty.hidden = results.length > 0;
  count.textContent = "Showing " + results.length + " of " + PRODUCTS.length + " products";
}

/* Small reusable debounce so search does not re-render on every key */
function debounce(fn, wait) {
  let timeout;
  return function () {
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      fn.apply(null, args);
    }, wait);
  };
}

function initShop() {
  const search = document.getElementById("search");
  const categoryBoxes = document.querySelectorAll('input[name="category"]');
  const priceBoxes = document.querySelectorAll('input[name="price"]');
  const pills = document.querySelectorAll("[data-sort]");
  const filters = document.getElementById("filters");
  const filtersToggle = document.getElementById("filters-toggle");

  // show how many products are in each category
  categoryBoxes.forEach(function (box) {
    const total = PRODUCTS.filter(function (product) {
      return product.category === box.value;
    }).length;
    const counter = box.parentElement.querySelector(".muted");
    if (counter) counter.textContent = "(" + total + ")";
  });

  // pre-select a category from links like products.html?category=Toys
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("category");
  if (fromUrl && CATEGORIES.includes(fromUrl)) {
    shopState.categories.add(fromUrl);
    categoryBoxes.forEach(function (box) {
      box.checked = box.value === fromUrl;
    });
  }
  if (params.get("q")) {
    search.value = params.get("q");
    shopState.query = search.value;
  }
  if (window.location.hash === "#search") search.focus();

  search.addEventListener("input", debounce(function () {
    shopState.query = search.value;
    renderProducts();
  }, 200));

  categoryBoxes.forEach(function (box) {
    box.addEventListener("change", function () {
      if (box.checked) shopState.categories.add(box.value);
      else shopState.categories.delete(box.value);
      renderProducts();
    });
  });

  priceBoxes.forEach(function (box) {
    box.addEventListener("change", function () {
      if (box.checked) shopState.prices.add(box.value);
      else shopState.prices.delete(box.value);
      renderProducts();
    });
  });

  pills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      shopState.sort = pill.dataset.sort;
      pills.forEach(function (other) {
        other.setAttribute("aria-pressed", other === pill ? "true" : "false");
      });
      renderProducts();
    });
  });

  function clearFilters() {
    shopState.query = "";
    shopState.categories.clear();
    shopState.prices.clear();
    search.value = "";
    categoryBoxes.forEach(function (box) { box.checked = false; });
    priceBoxes.forEach(function (box) { box.checked = false; });
    renderProducts();
  }
  document.getElementById("clear-filters").addEventListener("click", clearFilters);
  document.getElementById("reset-search").addEventListener("click", clearFilters);

  // mobile: show / hide the filter panel
  filtersToggle.addEventListener("click", function () {
    const open = filtersToggle.getAttribute("aria-expanded") !== "true";
    filtersToggle.setAttribute("aria-expanded", open ? "true" : "false");
    filtersToggle.textContent = open ? "Hide Filters" : "Show Filters";
    filters.classList.toggle("open", open);
  });

  renderProducts();
}

document.addEventListener("DOMContentLoaded", initShop);
