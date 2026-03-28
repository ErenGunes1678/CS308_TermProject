import { useState } from "react";
import { ArrowRight } from "lucide-react";
import "./NewsletterBanner.css";

function NewsletterBanner() {
  const [email, setEmail] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    console.log(email);
  }

  return (
    <section className="newsletter">
      <h2>Join the Beauty Club</h2>

      <p>
        Get 15% off your first order + exclusive beauty tips &
        early access to new launches
      </p>

      <form onSubmit={handleSubmit} className="newsletter-form">
        <input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit">
          Subscribe <ArrowRight size={16} />
        </button>
      </form>
    </section>
  );
}

export default NewsletterBanner;