import { useEffect, useMemo, useState } from "react";
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

const FALLBACK_TESTIMONIALS = [
  {
    id: "fallback-1",
    author: "Emma K.",
    role: "Beauty Enthusiast",
    content:
      "Lumière has completely transformed my beauty routine. The quality is unmatched!",
    initial: "E",
  },
  {
    id: "fallback-2",
    author: "Sofia T.",
    role: "Skincare Lover",
    content:
      "My orders always arrive fast, and the product recommendations feel surprisingly personal.",
    initial: "S",
  },
  {
    id: "fallback-3",
    author: "Nina R.",
    role: "Verified Buyer",
    content:
      "I found shades and formulas here that I now use every single day. It feels premium and easy.",
    initial: "N",
  },
];

function LoginPage() {
  const navigate = useNavigate();
  const { login, register, isAuthenticated, isLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryMode = getModeFromQuery(searchParams.get("mode"));
  const mode = queryMode;
  const [showPassword, setShowPassword] = useState(false);
  const [testimonials, setTestimonials] = useState(FALLBACK_TESTIMONIALS);
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
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

  const activeTestimonial = useMemo(
    () => testimonials[activeTestimonialIndex] || FALLBACK_TESTIMONIALS[0],
    [activeTestimonialIndex, testimonials]
  );

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

 /* useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/account", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);
*/
  useEffect(() => {
    if (testimonials.length <= 1) {
      return undefined;
    }

    const rotationTimer = window.setInterval(() => {
      setActiveTestimonialIndex((currentIndex) => {
        if (testimonials.length <= 1) {
          return currentIndex;
        }

        let nextIndex = currentIndex;

        while (nextIndex === currentIndex) {
          nextIndex = Math.floor(Math.random() * testimonials.length);
        }

        return nextIndex;
      });
    }, 15000);

    return () => {
      window.clearInterval(rotationTimer);
    };
  }, [testimonials]);

  return (
    <div className="login-page-layout">
      <Navbar />

      <main className="login-hero">
        <AuthHeroPanel activeTestimonial={activeTestimonial} />
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
