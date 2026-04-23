import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import "./AuthFormPanel.css";

function AuthFormPanel({
  mode,
  showPassword,
  loginForm,
  registerForm,
  passwordsMatch,
  successMessage,
  errorMessage,
  isSubmitting,
  setShowPassword,
  setLoginForm,
  setRegisterForm,
  onModeChange,
  onLoginSubmit,
  onRegisterSubmit,
}) {
  return (
    <section className="login-hero-right">
      <div className="auth-switch">
        <span
          className={`auth-switch__indicator auth-switch__indicator--${mode}`}
          aria-hidden="true"
        />
        <button
          type="button"
          className={`auth-tab ${mode === "login" ? "active" : ""}`}
          onClick={() => onModeChange("login")}
        >
          Sign In
        </button>

        <button
          type="button"
          className={`auth-tab ${mode === "register" ? "active" : ""}`}
          onClick={() => onModeChange("register")}
        >
          Create Account
        </button>
      </div>

      <div className="login-box">
        <div className="auth-panel">
          <div
            key={mode}
            className={`auth-panel__content auth-panel__content--${mode}`}
          >
            <h2>{mode === "login" ? "Welcome back" : "Create account"}</h2>

            <div className="auth-divider" aria-hidden="true" />

            {successMessage ? (
              <div className="auth-message auth-message--success" role="status">
                {successMessage}
              </div>
            ) : null}

            {errorMessage ? (
              <div className="auth-message auth-message--error" role="alert">
                {errorMessage}
              </div>
            ) : null}

            {mode === "login" ? (
              <form onSubmit={onLoginSubmit} className="login-form-v2">
                <label>Email</label>
                <div className="input-with-icon">
                  <Mail size={16} />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm({
                        ...loginForm,
                        email: e.target.value,
                      })
                    }
                  />
                </div>

                <label>Password</label>
                <div className="input-with-icon">
                  <Lock size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({
                        ...loginForm,
                        password: e.target.value,
                      })
                    }
                  />
                  {showPassword ? (
                    <EyeOff
                      size={16}
                      className="eye-icon"
                      onClick={() => setShowPassword(false)}
                    />
                  ) : (
                    <Eye
                      size={16}
                      className="eye-icon"
                      onClick={() => setShowPassword(true)}
                    />
                  )}
                </div>

                <div className="forgot-password-row">
                  <a href="#">Forgot password?</a>
                </div>

                <button
                  type="submit"
                  className="sign-in-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing In..." : "Sign In"}{" "}
                  <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <form
                onSubmit={onRegisterSubmit}
                className="login-form-v2 login-form-v2--register"
              >
                <label>Full Name</label>
                <div className="input-with-icon">
                  <User size={16} />
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={registerForm.name}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <label>Email</label>
                <div className="input-with-icon">
                  <Mail size={16} />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={registerForm.email}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        email: e.target.value,
                      })
                    }
                  />
                </div>

                <label>Password</label>
                <div className="input-with-icon">
                  <Lock size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={registerForm.password}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        password: e.target.value,
                      })
                    }
                  />
                  {showPassword ? (
                    <EyeOff
                      size={16}
                      className="eye-icon"
                      onClick={() => setShowPassword(false)}
                    />
                  ) : (
                    <Eye
                      size={16}
                      className="eye-icon"
                      onClick={() => setShowPassword(true)}
                    />
                  )}
                </div>

                <label>Confirm Password</label>
                <div
                  className={`input-with-icon ${
                    passwordsMatch ? "" : "input-with-icon--error"
                  }`}
                >
                  <Lock size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={registerForm.confirmPassword}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>
                {!passwordsMatch && (
                  <p className="form-error-text">Passwords do not match.</p>
                )}

                <button
                  type="submit"
                  className="sign-in-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}{" "}
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AuthFormPanel;
