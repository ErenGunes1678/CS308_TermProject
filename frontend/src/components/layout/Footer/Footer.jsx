//update
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      {/* Newsletter CTA */}
      <div className="footer__cta">
        <div className="container footer__cta-inner">
          <h2 className="footer__cta-title">Join the Beauty Club</h2>
          <p className="footer__cta-text">
            Get 15% off your first order + exclusive beauty tips & early access to new launches
          </p>
          <div className="footer__cta-form">
            <input
              type="email"
              placeholder="Your email address"
              className="footer__cta-input"
            />
            <button className="footer__cta-btn">
              Subscribe <span>&rarr;</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Content */}
      <div className="footer__main">
        <div className="container footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <span className="footer__logo-icon">L</span>
              <span className="footer__logo-text">Lumière</span>
              <span className="footer__logo-dot">.</span>
            </Link>
            <p className="footer__brand-desc">
              A premium beauty destination curating the finest makeup, skincare, haircare, and grooming products for every person.
            </p>
            <div className="footer__socials">
              {['instagram', 'twitter', 'youtube', 'facebook'].map((social) => (
                <a key={social} href="#" className="footer__social-link" aria-label={social}>
                  <SocialIcon name={social} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div className="footer__col">
            <h4 className="footer__col-title">SHOP</h4>
            <ul className="footer__col-links">
              <li><Link to="/category/makeup">Makeup</Link></li>
              <li><Link to="/category/skincare">Skincare</Link></li>
              <li><Link to="/category/haircare">Haircare</Link></li>
              <li><Link to="/category/men-care">Men Care</Link></li>
              <li><Link to="/products?sort=best-sellers">Best Sellers</Link></li>
              <li><Link to="/products?sort=new">New Arrivals</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div className="footer__col">
            <h4 className="footer__col-title">HELP</h4>
            <ul className="footer__col-links">
              <li><Link to="/profile">My Account</Link></li>
              <li><Link to="/orders">Order Tracking</Link></li>
              <li><Link to="/returns">Returns & Exchanges</Link></li>
              <li><Link to="/shipping">Shipping Info</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer__col">
            <h4 className="footer__col-title">CONTACT</h4>
            <ul className="footer__contact-list">
              <li className="footer__contact-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                123 Beauty Ave, Paris, France 75001
              </li>
              <li className="footer__contact-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                +1 (800) LUMIERE
              </li>
              <li className="footer__contact-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                hello@lumiere.beauty
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>&copy; 2026 Lumière Beauty. All rights reserved.</p>
          <div className="footer__bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/cookies">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon = ({ name }) => {
  const icons = {
    instagram: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
    twitter: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
      </svg>
    ),
    youtube: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
      </svg>
    ),
    facebook: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  };
  return icons[name] || null;
};

export default Footer;