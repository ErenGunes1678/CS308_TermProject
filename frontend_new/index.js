import {
  apiRequest,
  clearMessage,
  escapeHtml,
  formatPrice,
  refreshHeaderState,
  setupCommonUi,
  showMessage,
} from "./shared.js";

const messageBox = document.querySelector("[data-page-message]");
const productGrid = document.querySelector("[data-product-grid]");

function renderProducts(products) {
  if (!products.length) {
    productGrid.innerHTML = '<div class="empty-state">No products came back from `GET /product`.</div>';
    return;
  }

  productGrid.innerHTML = products
    .map(
      (product) => `
        <article class="card">
          <div class="stack">
            <h3>${escapeHtml(product.name)}</h3>
            <div class="product-meta">
              <span>Model: ${escapeHtml(product.model || "-")}</span>
              <span>Serial: ${escapeHtml(product.serial_number || "-")}</span>
              <span>Stock: ${escapeHtml(product.quantity_in_stock)}</span>
              <span>Distributor: ${escapeHtml(product.distributor_info || "-")}</span>
            </div>
            <p class="muted">${escapeHtml(product.description || "No description provided.")}</p>
          </div>
          <div class="stack">
            <div class="price">${formatPrice(product.price)}</div>
            <form class="inline-form" data-add-form="${product.id}">
              <input
                type="number"
                name="quantity"
                min="1"
                max="${Math.max(Number(product.quantity_in_stock) || 1, 1)}"
                value="1"
              />
              <button class="primary-button" type="submit">Add To Cart</button>
            </form>
          </div>
        </article>
      `
    )
    .join("");

  document.querySelectorAll("[data-add-form]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearMessage(messageBox);

      const productId = Number(form.getAttribute("data-add-form"));
      const quantity = Number(new FormData(form).get("quantity"));

      try {
        await apiRequest("/cart/add", {
          method: "POST",
          body: {
            product_id: productId,
            quantity,
          },
        });
        await refreshHeaderState();
        showMessage(messageBox, "Item added to cart successfully.");
      } catch (error) {
        showMessage(messageBox, error.message, "error");
      }
    });
  });
}

async function loadProducts() {
  clearMessage(messageBox);
  productGrid.innerHTML = '<div class="empty-state">Loading products...</div>';

  try {
    const data = await apiRequest("/product");
    renderProducts(data.products || []);
  } catch (error) {
    productGrid.innerHTML = "";
    showMessage(messageBox, error.message, "error");
  }
}

setupCommonUi("home");
await refreshHeaderState();
await loadProducts();
