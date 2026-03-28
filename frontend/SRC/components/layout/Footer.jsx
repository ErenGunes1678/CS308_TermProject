import {
  Mail,
  MapPin,
  Phone,
  Instagram,
  Facebook,
  Twitter,
  Youtube
} from "lucide-react";

import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-grid">

        <div className="footer-col brand">
          <div className="logo-row">
            <div className="logo-circle">L</div>
            <span>Lumière.</span>
          </div>

          <p>
            A premium beauty destination curating the finest makeup,
            skincare, haircare and grooming products for every person.
          </p>

          <div className="socials">
            <Instagram size={18}/>
            <Twitter size={18}/>
            <Youtube size={18}/>
            <Facebook size={18}/>
          </div>
        </div>


        <div className="footer-col">
          <h4>SHOP</h4>
          <a>Makeup</a>
          <a>Skincare</a>
          <a>Haircare</a>
          <a>Men Care</a>
          <a>Best Sellers</a>
          <a>New Arrivals</a>
        </div>


        <div className="footer-col">
          <h4>HELP</h4>
          <a>My Account</a>
          <a>Order Tracking</a>
          <a>Returns & Exchanges</a>
          <a>Shipping Info</a>
          <a>FAQ</a>
          <a>Contact Us</a>
        </div>


        <div className="footer-col">
          <h4>CONTACT</h4>

          <div className="contact-row">
            <MapPin size={16}/>
            <span>123 Beauty Ave, Paris</span>
          </div>

          <div className="contact-row">
            <Phone size={16}/>
            <span>+1 (800) LUMIERE</span>
          </div>

          <div className="contact-row">
            <Mail size={16}/>
            <span>hello@lumiere.beauty</span>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <span>© 2026 Lumière Beauty. All rights reserved.</span>

        <div className="footer-links">
          <a>Privacy Policy</a>
          <a>Terms of Service</a>
          <a>Cookie Policy</a>
        </div>
      </div>

    </footer>
  );
}

export default Footer;