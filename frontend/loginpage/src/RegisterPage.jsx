import { useState } from "react";
import { Link } from "react-router-dom";
import "./RegisterPage.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


function RegisterPage() {
  const [salutation, setSalutation] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [birthDate, setBirthDate] = useState(null);


  function handleSubmit(e) {
    e.preventDefault();

    console.log({
      salutation,
      firstName,
      lastName,
      day,
      month,
      year,
      email,
      password,
      newsletter,
    });
  }

  return (
    <div className="register-container">
      <div className="register-panel">
        <h1>Mağaza hesabı için kayıt olun</h1>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label className="group-label">Cinsiyet *</label>

            <div className="radio-row">
              <label className="radio-option">
                <input
                  type="radio"
                  name="salutation"
                  value="Kadın"
                  checked={salutation === "Kadın"}
                  onChange={(e) => setSalutation(e.target.value)}
                />
                <span>Kadın</span>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="salutation"
                  value="Erkek"
                  checked={salutation === "Erkek"}
                  onChange={(e) => setSalutation(e.target.value)}
                />
                <span>Erkek</span>
              </label>

            </div>
          </div>

          <div className="name-row">
            <div className="input-group">
              <label>İsim *</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Soyisim *</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

        
          <div className="name-row">
            <div className="input-group">
              <label>E-posta adresi *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Şifre *</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  👁
                </button>
              </div>
            </div>
          </div>
                <div className="birth-group">
        <label>Doğum tarihin</label>
        <DatePicker
            selected={birthDate}
            onChange={(date) => setBirthDate(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="GG/AA/YYYY"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            maxDate={new Date()}
            className="birth-input"
        />
        </div>

          <label className="checkbox-block">
            <input
              type="checkbox"
              checked={newsletter}
              onChange={() => setNewsletter(!newsletter)}
            />
            <span>
              <strong>
                Evet, "Mağaza" bülteni aracılığıyla kişiselleştirilmiş kuponlar,
                yarışmalar, yeni ürünler
              </strong>{" "}
              ve genel olarak "Mağaza" hakkında bilgi almak istiyorum. İstediğim zaman
              aboneliğimi iptal edebilirim.
              <br />
              <span className="underline-text">
                "Mağaza" bülteniyle ilgili notu kudum.
              </span>
            </span>
          </label>

          <p className="terms-text">
            Kaydolmakla, şunları kabul etmiş olursunuz:{" "}
            <span className="underline-text strong-text">
              Mağaza'nın kullanım şartları
            </span>{" "}
            Veri koruma hakkında bilgileri şurada bulabilirsiniz:{" "}
            <span className="underline-text strong-text">
              Mağaza'nın gizlilik politikası.
            </span>
          </p>

          <div className="bottom-row">
            <Link to="/login" className="back-link">
              Girişe dön
            </Link>

            <button type="submit" className="register-btn">
              Kayıt olmak
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;