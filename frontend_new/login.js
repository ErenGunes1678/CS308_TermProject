import {
  apiRequest,
  clearMessage,
  refreshHeaderState,
  setupCommonUi,
  showMessage,
} from "./shared.js";

const messageBox = document.querySelector("[data-page-message]");
const loginForm = document.querySelector("[data-login-form]");
const registerForm = document.querySelector("[data-register-form]");
const sessionInfo = document.querySelector("[data-session-info]");

async function updateSessionInfo() {
  try {
    await refreshHeaderState();
    sessionInfo.textContent =
      "This test UI does not check the current user automatically anymore. Use login or register, then verify behavior from the main page and cart page.";
  } catch (error) {
    sessionInfo.textContent = error.message;
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage(messageBox);

  const formData = new FormData(loginForm);

  try {
    await apiRequest("/auth/login", {
      method: "POST",
      body: {
        email: String(formData.get("email") || "").trim(),
        password: String(formData.get("password") || ""),
      },
    });

    showMessage(messageBox, "Login successful. Redirecting to the main page.");
    setTimeout(() => {
      window.location.href = "/";
    }, 700);
  } catch (error) {
    showMessage(messageBox, error.message, "error");
  }
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage(messageBox);

  const formData = new FormData(registerForm);

  try {
    await apiRequest("/auth/register", {
      method: "POST",
      body: {
        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        password: String(formData.get("password") || ""),
      },
    });

    showMessage(messageBox, "Registration successful. You are now signed in.");
    await updateSessionInfo();
  } catch (error) {
    showMessage(messageBox, error.message, "error");
  }
});

setupCommonUi("login");
await updateSessionInfo();
