/* ==========================================================================
   Toy Haven - Shopping cart page
   Renders the cart table and summary from localStorage.
   ========================================================================== */

"use strict";

function renderCart() {
  const cart = getCart();
  const totals = getCartTotals(cart);
  const body = document.getElementById("cart-body");
  const layout = document.getElementById("cart-layout");
  const empty = document.getElementById("cart-empty");

  layout.hidden = cart.length === 0;
  empty.hidden = cart.length > 0;
  if (cart.length === 0) return;

  body.innerHTML = totals.lines.map(function (line) {
    const product = line.product;
    return (
      '<tr class="cart-row" data-id="' + product.id + '">' +
      '<td class="cell-product"><div class="cart-product">' + mediaBox(product.image, product.name) +
      '<div><p class="cart-name">' + escapeHtml(product.name) + "</p><p>" + product.category + "</p></div></div></td>" +
      '<td data-label="Quantity"><div class="qty">' +
      '<button type="button" data-qty="-1" aria-label="Decrease quantity of ' + escapeHtml(product.name) + '">−</button>' +
      '<output aria-live="polite">' + line.qty + "</output>" +
      '<button type="button" data-qty="1" aria-label="Increase quantity of ' + escapeHtml(product.name) + '"' +
      (line.qty >= MAX_QTY ? " disabled" : "") + ">+</button>" +
      "</div></td>" +
      '<td data-label="Price">' + formatPrice(product.price) + "</td>" +
      '<td data-label="Subtotal"><strong>' + formatPrice(line.lineTotal) + "</strong></td>" +
      '<td class="cell-remove"><button class="icon-btn remove-btn" type="button" data-remove aria-label="Remove ' +
      escapeHtml(product.name) + ' from cart">' + ICONS.close + "</button></td>" +
      "</tr>"
    );
  }).join("");

  document.getElementById("sum-items").textContent = totals.itemCount;
  document.getElementById("sum-subtotal").textContent = formatPrice(totals.subtotal);
  document.getElementById("sum-shipping").textContent = totals.shipping === 0 ? "Free" : formatPrice(totals.shipping);
  document.getElementById("sum-total").textContent = formatPrice(totals.total);
  document.getElementById("shipping-note").textContent = totals.shipping === 0
    ? "You have unlocked free delivery!"
    : "Add " + formatPrice(FREE_SHIPPING_FROM - totals.subtotal) + " more for free delivery.";
}

function initCart() {
  const body = document.getElementById("cart-body");

  // one listener handles every + / - / remove button (event delegation)
  body.addEventListener("click", function (event) {
    const row = event.target.closest(".cart-row");
    if (!row) return;
    const id = row.dataset.id;
    const item = getCart().find(function (entry) { return entry.id === id; });
    if (!item) return;

    const qtyButton = event.target.closest("[data-qty]");
    if (qtyButton) {
      const next = item.qty + Number(qtyButton.dataset.qty);
      if (next < 1) {
        removeRow(row, id);
      } else {
        setCartQty(id, next);
        renderCart();
      }
    }
    if (event.target.closest("[data-remove]")) removeRow(row, id);
  });

  function removeRow(row, id) {
    const name = getProductById(id).name;
    row.classList.add("removing");
    setTimeout(function () {
      setCartQty(id, 0);
      renderCart();
      showToast(name + " removed from cart");
    }, 320);
  }

  document.getElementById("clear-cart").addEventListener("click", async function () {
    const confirmed = await showDialog({
      title: "Clear your cart?",
      html: "<p>This removes every item from your cart. This cannot be undone.</p>",
      confirmText: "Clear Cart",
      confirmClass: "btn-dark"
    });
    if (confirmed) {
      clearCart();
      renderCart();
      showToast("Your cart has been cleared");
    }
  });

  renderCart();
}

document.addEventListener("DOMContentLoaded", initCart);
