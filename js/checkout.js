/* ==========================================================================
   Toy Haven - Checkout page
   Validates the form, shows an order review, then saves the order.
   ========================================================================== */

"use strict";

function renderOrderSummary() {
  const cart = getCart();
  const totals = getCartTotals(cart);
  const empty = cart.length === 0;

  document.getElementById("checkout-layout").hidden = empty;
  document.getElementById("checkout-empty").hidden = !empty;
  if (empty) return totals;

  document.getElementById("order-items").innerHTML = totals.lines.map(function (line) {
    return (
      "<li>" + mediaBox(line.product.image, line.product.name) +
      "<div><h3>" + escapeHtml(line.product.name) + "</h3><p>Qty " + line.qty + " × " + formatPrice(line.product.price) + "</p></div>" +
      "<strong>" + formatPrice(line.lineTotal) + "</strong></li>"
    );
  }).join("");

  document.getElementById("co-subtotal").textContent = formatPrice(totals.subtotal);
  document.getElementById("co-shipping").textContent = totals.shipping === 0 ? "Free" : formatPrice(totals.shipping);
  document.getElementById("co-total").textContent = formatPrice(totals.total);
  return totals;
}

function renderOrderHistory() {
  const orders = loadData(STORAGE_KEYS.orders, []);
  const list = document.getElementById("order-history");
  document.getElementById("history-empty").hidden = orders.length > 0;

  list.innerHTML = orders.slice().reverse().map(function (order) {
    const date = new Date(order.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    return (
      "<li><strong>" + order.id + "</strong><span>" + date + "</span>" +
      "<span>" + order.itemCount + " item(s) · " + order.paymentLabel + "</span>" +
      "<strong>" + formatPrice(order.total) + "</strong></li>"
    );
  }).join("");
}

/* ---------- Card detail checks (simulation only) ---------- */
function checkCardNumber(value) {
  const digits = value.replace(/\s/g, "");
  if (!digits) return "Please enter a card number.";
  if (!/^\d{16}$/.test(digits)) return "Card number must be 16 digits.";
  return "";
}

function checkExpiry(value) {
  const match = value.trim().match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
  if (!match) return "Use the format MM/YY.";
  const now = new Date();
  const expiry = new Date(2000 + Number(match[2]), Number(match[1])); // first day after expiry month
  if (expiry <= now) return "This card has expired.";
  return "";
}

function checkCvv(value) {
  return /^\d{3}$/.test(value.trim()) ? "" : "CVV must be 3 digits.";
}

/* ---------- Animated success message ---------- */
function showSuccess(order) {
  const overlay = document.createElement("div");
  overlay.className = "success-overlay";
  overlay.innerHTML =
    '<div class="success-card" role="alertdialog" aria-modal="true" aria-labelledby="success-title" aria-describedby="success-text">' +
    ICONS.check +
    '<h2 id="success-title">Order placed!</h2>' +
    '<p id="success-text">Thank you, ' + escapeHtml(order.customer.name) + ". Your order <strong>" + order.id +
    "</strong> of " + formatPrice(order.total) + " is on its way.</p>" +
    '<a class="btn btn-primary" href="index.html">Back to Home</a>' +
    "</div>";

  // a burst of confetti pieces
  const colours = ["#ffd23f", "#c2410c", "#0f766e", "#1f2544"];
  const card = overlay.querySelector(".success-card");
  for (let i = 0; i < 28; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = Math.random() * 100 + "%";
    piece.style.background = colours[i % colours.length];
    piece.style.animationDelay = Math.random() * 0.6 + "s";
    card.appendChild(piece);
  }

  document.body.appendChild(overlay);
  overlay.querySelector("a").focus();
}

function initCheckout() {
  const form = document.getElementById("checkout-form");
  const nameInput = document.getElementById("full-name");
  const emailInput = document.getElementById("email");
  const addressInput = document.getElementById("address");
  const cityInput = document.getElementById("city");
  const cardNumber = document.getElementById("card-number");
  const cardExpiry = document.getElementById("card-expiry");
  const cardCvv = document.getElementById("card-cvv");
  const cardFields = document.getElementById("card-fields");
  const paymentRadios = form.querySelectorAll('input[name="payment"]');
  const paymentError = document.getElementById("payment-error");

  renderOrderSummary();
  renderOrderHistory();

  const cityCheck = function (value) { return value ? "" : "Please choose your city."; };
  liveValidate(nameInput, validators.name);
  liveValidate(emailInput, validators.email);
  liveValidate(addressInput, validators.minLength("delivery address", 10));
  liveValidate(cityInput, cityCheck);
  liveValidate(cardNumber, checkCardNumber);
  liveValidate(cardExpiry, checkExpiry);
  liveValidate(cardCvv, checkCvv);
  cityInput.addEventListener("change", function () { setFieldError(cityInput, cityCheck(cityInput.value)); });

  function selectedPayment() {
    const checked = form.querySelector('input[name="payment"]:checked');
    return checked ? checked.value : "";
  }

  // show card fields only when "Card" is chosen
  paymentRadios.forEach(function (radio) {
    radio.addEventListener("change", function () {
      paymentRadios.forEach(function (other) {
        other.closest(".radio-card").classList.toggle("is-checked", other.checked);
      });
      cardFields.hidden = selectedPayment() !== "card";
      paymentError.textContent = "";
    });
  });

  // auto-format the card number as 1234 5678 9012 3456 and expiry as MM/YY
  cardNumber.addEventListener("input", function () {
    cardNumber.value = cardNumber.value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
  });
  cardExpiry.addEventListener("input", function () {
    const digits = cardExpiry.value.replace(/\D/g, "").slice(0, 4);
    cardExpiry.value = digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits;
  });
  cardCvv.addEventListener("input", function () {
    cardCvv.value = cardCvv.value.replace(/\D/g, "").slice(0, 3);
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const rules = [
      { input: nameInput, check: validators.name },
      { input: emailInput, check: validators.email },
      { input: addressInput, check: validators.minLength("delivery address", 10) },
      { input: cityInput, check: cityCheck }
    ];
    const payment = selectedPayment();
    if (payment === "card") {
      rules.push({ input: cardNumber, check: checkCardNumber });
      rules.push({ input: cardExpiry, check: checkExpiry });
      rules.push({ input: cardCvv, check: checkCvv });
    }

    let valid = validateFields(rules);
    if (!payment) {
      paymentError.textContent = "Please choose a payment method.";
      if (valid) {
        paymentRadios[0].focus();
        showToast("Please choose a payment method.", "error");
      }
      valid = false;
    }
    if (!valid) return;

    const totals = getCartTotals(getCart());
    if (totals.itemCount === 0) {
      renderOrderSummary();
      return;
    }

    const paymentLabel = payment === "card"
      ? "Card ending " + cardNumber.value.replace(/\s/g, "").slice(-4)
      : "Cash on Delivery";

    // order summary shown before the user confirms
    const itemsHtml = totals.lines.map(function (line) {
      return "<li>" + escapeHtml(line.product.name) + " × " + line.qty + " — " + formatPrice(line.lineTotal) + "</li>";
    }).join("");

    const confirmed = await showDialog({
      title: "Confirm your order",
      html:
        '<dl class="review-list">' +
        "<dt>Name</dt><dd>" + escapeHtml(nameInput.value.trim()) + "</dd>" +
        "<dt>Email</dt><dd>" + escapeHtml(emailInput.value.trim()) + "</dd>" +
        "<dt>Deliver to</dt><dd>" + escapeHtml(addressInput.value.trim()) + ", " + escapeHtml(cityInput.value) + "</dd>" +
        "<dt>Payment</dt><dd>" + paymentLabel + "</dd>" +
        "</dl><ul>" + itemsHtml + "</ul>" +
        '<div class="summary-row"><span>Shipping</span><span>' + (totals.shipping ? formatPrice(totals.shipping) : "Free") + "</span></div>" +
        '<div class="summary-row total"><span>Total</span><span>' + formatPrice(totals.total) + "</span></div>",
      confirmText: "Place Order",
      cancelText: "Edit Details",
      confirmClass: "btn-dark"
    });
    if (!confirmed) return;

    // short simulated "processing" state with a spinner
    const buttons = document.querySelectorAll('button[type="submit"]');
    buttons.forEach(function (button) {
      button.disabled = true;
      button.dataset.label = button.textContent;
      button.innerHTML = '<span class="spinner" aria-hidden="true"></span> Processing…';
    });

    setTimeout(function () {
      const order = {
        id: "TH-" + Date.now().toString().slice(-6),
        date: new Date().toISOString(),
        customer: {
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          address: addressInput.value.trim(),
          city: cityInput.value
        },
        payment: payment,
        paymentLabel: paymentLabel,
        items: totals.lines.map(function (line) {
          return { id: line.product.id, name: line.product.name, qty: line.qty, price: line.product.price };
        }),
        itemCount: totals.itemCount,
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        total: totals.total
      };

      const orders = loadData(STORAGE_KEYS.orders, []);
      orders.push(order);
      saveData(STORAGE_KEYS.orders, orders);
      clearCart();

      form.reset();
      buttons.forEach(function (button) {
        button.disabled = false;
        button.textContent = button.dataset.label;
      });
      showSuccess(order);
      renderOrderSummary();
      renderOrderHistory();
    }, 1400);
  });
}

document.addEventListener("DOMContentLoaded", initCheckout);
