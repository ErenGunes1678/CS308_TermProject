const DEFAULT_API_BASE = "http://localhost:3000";

function getBrowserDefaultApiBase() {
  if (typeof window === "undefined") {
    return DEFAULT_API_BASE;
  }

  return `${window.location.protocol}//${window.location.hostname}:3000`;
}

function enforceLocalhostHost() {
  if (typeof window === "undefined") {
    return;
  }

  // Guest cart uses an httpOnly cookie, so we keep frontend/backend on localhost
  // to avoid cross-site cookie behavior during simple local testing.
  if (window.location.hostname === "127.0.0.1") {
    const redirectedUrl = new URL(window.location.href);
    redirectedUrl.hostname = "localhost";
    window.location.replace(redirectedUrl.toString());
  }
}

enforceLocalhostHost();

function normalizeBaseUrl(url) {
  const trimmed = String(url || "").trim();
  if (!trimmed) {
    return getBrowserDefaultApiBase();
  }

  return trimmed.replace(/\/+$/, "");
}

export function getApiBase() {
  return normalizeBaseUrl(localStorage.getItem("frontend_new_api_base"));
}

export function saveApiBase(url) {
  const normalized = normalizeBaseUrl(url);
  localStorage.setItem("frontend_new_api_base", normalized);
  return normalized;
}

export function formatPrice(value) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return String(value ?? "");
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numeric);
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function apiRequest(path, options = {}) {
  const requestOptions = {
    method: options.method || "GET",
    credentials: "include",
    headers: {
      ...(options.headers || {}),
    },
  };

  if (options.body !== undefined) {
    requestOptions.headers["Content-Type"] = "application/json";
    requestOptions.body = JSON.stringify(options.body);
  }

  let response;

  try {
    response = await fetch(`${getApiBase()}${path}`, requestOptions);
  } catch (error) {
    const networkError = new Error(
      `Could not reach ${getApiBase()}. Make sure your backend is running and the API base is correct.`
    );
    networkError.cause = error;
    throw networkError;
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && data.message) ||
      `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data;
}

export async function getCart() {
  return apiRequest("/cart");
}

export async function refreshHeaderState() {
  const userStatus = document.querySelector("[data-user-status]");
  const cartCount = document.querySelector("[data-cart-count]");
  const logoutButton = document.querySelector("[data-logout]");
  const cart = await getCart();

  if (userStatus) {
    userStatus.textContent = "Login state is not checked on this test UI.";
  }

  if (cartCount) {
    const totalItems = (cart.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    cartCount.textContent = String(totalItems);
  }

  if (logoutButton) {
    logoutButton.classList.remove("hidden");
  }

  return { user: null, cart };
}

export function showMessage(element, message, type = "success") {
  if (!element) {
    return;
  }

  element.textContent = message;
  element.className = `message-panel ${type}`;
  element.classList.remove("hidden");
}

export function clearMessage(element) {
  if (!element) {
    return;
  }

  element.textContent = "";
  element.className = "message-panel hidden";
}

export function setupCommonUi(activePage) {
  const apiBaseInput = document.querySelector("[data-api-base-input]");
  const saveApiBaseButton = document.querySelector("[data-save-api-base]");
  const logoutButton = document.querySelector("[data-logout]");

  document.querySelectorAll("[data-nav-link]").forEach((link) => {
    const page = link.getAttribute("data-nav-link");
    link.classList.toggle("active", page === activePage);
  });

  if (apiBaseInput) {
    apiBaseInput.value = getApiBase();
  }

  if (saveApiBaseButton) {
    saveApiBaseButton.addEventListener("click", () => {
      saveApiBase(apiBaseInput.value);
      window.location.reload();
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      await apiRequest("/auth/logout", { method: "POST" });
      window.location.href = "/login.html";
    });
  }
}
