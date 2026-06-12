import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../components/layout/Navbar/Navbar";
import Footer from "../../components/layout/Footer/Footer";
import AuthHeroPanel from "./AuthHeroPanel";
import AuthFormPanel from "./AuthFormPanel";
import "./LoginPage.css";
import { getAuthErrorMessage } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";

const getModeFromQuery = (value) =>
  value === "register" ? "register" : "login";

function LoginPage() {
  const navigate = useNavigate();
  const { login, register, isAuthenticated, isLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryMode = getModeFromQuery(searchParams.get("mode"));
  const mode = queryMode;
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const data = await login(loginForm);
      const role = data?.user?.role;

      if (role === "sales_manager") {
        navigate("/admin/sales-manager/revenue", { replace: true });
      } else if (role === "product_manager") {
        navigate("/admin/product-manager/deliveries", { replace: true });
      } else {
        navigate("/account", { replace: true });
      }
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error, "Unable to sign in."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (registerForm.password !== registerForm.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register(registerForm);
      navigate("/account");
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error, "Unable to create account."));
    } finally {
      setIsSubmitting(false);
    }
  }

  const passwordsMatch =
    registerForm.confirmPassword === "" ||
    registerForm.password === registerForm.confirmPassword;

  function handleModeChange(nextMode) {
    if (nextMode === queryMode) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setSearchParams(nextMode === "register" ? { mode: "register" } : {});
  }
  return (
    <div className="login-page-layout">
      <Navbar />

      <main className="login-hero">
        <AuthHeroPanel />
        <AuthFormPanel
          mode={mode}
          showPassword={showPassword}
          loginForm={loginForm}
          registerForm={registerForm}
          passwordsMatch={passwordsMatch}
          successMessage={successMessage}
          errorMessage={errorMessage}
          isSubmitting={isSubmitting}
          setShowPassword={setShowPassword}
          setLoginForm={setLoginForm}
          setRegisterForm={setRegisterForm}
          onModeChange={handleModeChange}
          onLoginSubmit={handleLoginSubmit}
          onRegisterSubmit={handleRegisterSubmit}
        />
      </main>

      <Footer />
    </div>
  );
}

export default LoginPage;
