/* ==========================================================================
   Toy Haven - Home page
   Hero slider, Product of the Day, featured products and new arrivals.
   ========================================================================== */

"use strict";

/* ---------- Auto-rotating hero slider ---------- */
function initHeroSlider() {
  const slider = document.getElementById("hero-slider");
  if (!slider) return;
  const track = slider.querySelector(".slides");
  const slides = Array.from(slider.querySelectorAll(".slide"));
  const dotsWrap = slider.querySelector(".slider-dots");
  let current = 0;
  let timer = null;
  let touchStartX = 0;

  // one dot button per slide
  const dots = slides.map(function (slide, index) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "slider-dot";
    dot.setAttribute("aria-label", "Show banner " + (index + 1));
    dot.addEventListener("click", function () {
      goTo(index);
      restart();
    });
    dotsWrap.appendChild(dot);
    return dot;
  });

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = "translateX(-" + current * 100 + "%)";
    slides.forEach(function (slide, i) {
      const active = i === current;
      slide.classList.toggle("is-active", active);
      slide.inert = !active; // hidden slides cannot be tabbed into
      slide.setAttribute("aria-hidden", active ? "false" : "true");
      dots[i].setAttribute("aria-current", active ? "true" : "false");
    });
  }

  function start() {
    stop();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer = setInterval(function () {
      goTo(current + 1);
    }, 5000);
  }

  function stop() {
    clearInterval(timer);
  }

  function restart() {
    start();
  }

  slider.querySelector(".slider-prev").addEventListener("click", function () {
    goTo(current - 1);
    restart();
  });
  slider.querySelector(".slider-next").addEventListener("click", function () {
    goTo(current + 1);
    restart();
  });

  // pause while the user is hovering or using the keyboard inside
  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);
  slider.addEventListener("focusin", stop);
  slider.addEventListener("focusout", start);

  // swipe on touch screens
  slider.addEventListener("touchstart", function (event) {
    touchStartX = event.touches[0].clientX;
  }, { passive: true });
  slider.addEventListener("touchend", function (event) {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 50) {
      goTo(distance < 0 ? current + 1 : current - 1);
      restart();
    }
  });

  goTo(0);
  start();
}

/* ---------- Product of the Day ----------
   The pick changes every day but is the same for everyone on that date:
   the date (YYYYMMDD) is turned into an index in the product list. */
function getProductOfTheDay(date) {
  const key = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  return PRODUCTS[key % PRODUCTS.length];
}

function initProductOfTheDay() {
  const box = document.getElementById("potd");
  if (!box) return;
  const product = getProductOfTheDay(new Date());

  box.innerHTML =
    mediaBox(product.image, product.name) +
    "<div>" +
    '<span class="potd-label">Product of the Day</span>' +
    '<h2 id="potd-title">' + escapeHtml(product.name) + "</h2>" +
    '<p class="potd-price">' + formatPrice(product.price) + ' <span class="muted">· ' + product.category + "</span></p>" +
    '<p class="potd-timer">Next pick in <span id="potd-countdown">--:--:--</span></p>' +
    '<button class="btn btn-dark btn-sm" type="button" id="potd-view">View Product</button>' +
    "</div>";

  document.getElementById("potd-view").addEventListener("click", function () {
    openProductModal(product);
  });

  const countdown = document.getElementById("potd-countdown");
  function tick() {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const seconds = Math.floor((midnight - now) / 1000);
    const parts = [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60];
    countdown.textContent = parts.map(function (part) {
      return String(part).padStart(2, "0");
    }).join(":");
    if (seconds <= 1) setTimeout(initProductOfTheDay, 1500); // roll over at midnight
  }
  tick();
  setInterval(tick, 1000);
}

/* ---------- Featured products + new arrivals ---------- */
function renderFeatured() {
  const grid = document.getElementById("featured-grid");
  if (!grid) return;
  PRODUCTS.filter(function (product) {
    return product.featured;
  }).slice(0, 4).forEach(function (product) {
    grid.appendChild(createProductCard(product));
  });
}

function renderNewArrivals() {
  const grid = document.getElementById("new-grid");
  if (!grid) return;
  PRODUCTS.filter(function (product) {
    return product.isNew;
  }).slice(0, 3).forEach(function (product) {
    const card = document.createElement("article");
    card.className = "wide-card reveal";
    card.innerHTML =
      mediaBox(product.image, product.name, "media-wide") +
      "<h3>" + escapeHtml(product.name) + "</h3>" +
      "<p>" + product.category + " · " + formatPrice(product.price) + "</p>" +
      '<button class="btn btn-outline btn-sm" type="button">Quick View</button>';
    card.querySelector("button").addEventListener("click", function () {
      openProductModal(product);
    });
    grid.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initHeroSlider();
  initProductOfTheDay();
  renderFeatured();
  renderNewArrivals();
  watchReveal();
});
