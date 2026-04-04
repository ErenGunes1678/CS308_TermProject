import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../../components/layout/Navbar/Navbar";
import Footer from "../../components/layout/Footer/Footer";
import AuthHeroPanel from "./AuthHeroPanel";
import AuthFormPanel from "./AuthFormPanel";
import "./LoginPage.css";

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

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function LoginPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryMode = getModeFromQuery(searchParams.get("mode"));
  const mode = queryMode;
  const [showPassword, setShowPassword] = useState(false);
  const [testimonials, setTestimonials] = useState(FALLBACK_TESTIMONIALS);
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);

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

  function handleLoginSubmit(e) {
    e.preventDefault();
    console.log("Login:", loginForm);
  }

  function handleRegisterSubmit(e) {
    e.preventDefault();

    if (registerForm.password !== registerForm.confirmPassword) {
      return;
    }

    console.log("Register:", registerForm);
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

    setSearchParams(nextMode === "register" ? { mode: "register" } : {});
  }

  useEffect(() => {
    let isMounted = true;

    async function loadTestimonials() {
      try {
        const response = await fetch(`${API_BASE_URL}/testimonials`);

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (
          isMounted &&
          Array.isArray(data.testimonials) &&
          data.testimonials.length > 0
        ) {
          setTestimonials(data.testimonials);
          setActiveTestimonialIndex(0);
        }
      } catch (error) {
        console.error("Failed to load testimonials:", error);
      }
    }

    loadTestimonials();

    return () => {
      isMounted = false;
    };
  }, []);

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
