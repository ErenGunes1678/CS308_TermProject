import { useState } from "react";
import { Link } from "react-router-dom";
import "./LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  function handleSubmit(e) {
    e.preventDefault();
    console.log(email, password, keepSignedIn);
  }

  return (
    <div className="login-container">
      <div className="login-panel">
        <div className="brand">Mağaza_Adı</div>
        <h1>Mağazamıza Hoşgeldiniz</h1>

        <form onSubmit={handleSubmit} className="login-form">
          <label>E-posta adresin</label>
          <div className="field">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <label>Şifren</label>
          <div className="field password-field">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              👁
            </span>
          </div>

          <div className="forgot-row">
            <a href="#">Şifrenizi mi unuttunuz?</a>
          </div>

          <div className="checkbox-row">
            <input
              type="checkbox"
              checked={keepSignedIn}
              onChange={() => setKeepSignedIn(!keepSignedIn)}
            />
            <span>Oturum açık kalsın</span>
          </div>

          <button type="submit" className="primary-btn">
            Giriş Yap
          </button>

          <div className="divider">
            <span>Yeni misin?</span>
          </div>

          <Link to="/register" className="secondary-btn-link">
            Hesap Oluştur
          </Link>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;