import {
  apiRequest,
  clearMessage,
  escapeHtml,
  formatPrice,
  getCart,
  refreshHeaderState,
  setupCommonUi,
  showMessage,
} from "./shared.js";

const messageBox = document.querySelector("[data-page-message]");
const cartRoot = document.querySelector("[data-cart-root]");

function buildCartMarkup(items) {
  if (!items.length) {
    return '<div class="empty-state">Your cart is empty. Add products from the main page to test the backend cart APIs.</div>';
  }

  const total = items.reduce((sum, item) => {
    const unitPrice = Number(item.product?.price || 0);
    return sum + unitPrice * Number(item.quantity || 0);
  }, 0);

  const itemsMarkup = items
    .map((item) => {
      const product = item.product || {};
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(product.price || 0);
      const lineTotal = unitPrice * quantity;

      return `
        <article class="cart-item">
          <div>
            <h4>${escapeHtml(product.name || "Unknown product")}</h4>
            <div class="product-meta">
              <span>Product ID: ${escapeHtml(product.id || item.product_id)}</span>
              <span>Quantity in cart: ${escapeHtml(quantity)}</span>
              <span>Unit price: ${formatPrice(unitPrice)}</span>
              <span>Line total: ${formatPrice(lineTotal)}</span>
            </div>
          </div>
          <div class="cart-item-actions">
            <button class="small-button" type="button" data-decrease-item="${item.id}">
              Decrease 1
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  return `
    <div class="cart-list">${itemsMarkup}</div>
    <div class="cart-toolbar">
      <button class="danger-button" type="button" data-empty-cart>
        Empty Cart
      </button>
    </div>
    <div class="cart-summary">
      <span>Total</span>
      <span>${formatPrice(total)}</span>
    </div>
  `;
}

async function attachCartHandlers() {
  document.querySelectorAll("[data-decrease-item]").forEach((button) => {
    button.addEventListener("click", async () => {
      clearMessage(messageBox);

      try {
        const data = await apiRequest(`/cart/item/${button.getAttribute("data-decrease-item")}`, {
          method: "DELETE",
        });
        showMessage(messageBox, data.message || "Cart updated.");
        await loadCart();
      } catch (error) {
        showMessage(messageBox, error.message, "error");
      }
    });
  });

  const emptyCartButton = document.querySelector("[data-empty-cart]");
  if (emptyCartButton) {
    emptyCartButton.addEventListener("click", async () => {
      clearMessage(messageBox);

      try {
        const data = await apiRequest("/cart", { method: "DELETE" });
        showMessage(messageBox, data.message || "Cart emptied.");
        await loadCart();
      } catch (error) {
        showMessage(messageBox, error.message, "error");
      }
    });
  }
}

async function loadCart() {
  cartRoot.innerHTML = '<div class="empty-state">Loading cart...</div>';

  try {
    const data = await getCart();
    cartRoot.innerHTML = buildCartMarkup(data.items || []);
    await attachCartHandlers();
    await refreshHeaderState();
  } catch (error) {
    cartRoot.innerHTML = "";
    showMessage(messageBox, error.message, "error");
  }
}

setupCommonUi("cart");
await refreshHeaderState();
await loadCart();
