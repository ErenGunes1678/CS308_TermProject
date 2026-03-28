import { Search, Heart, ShoppingBag, User, ChevronDown } from "lucide-react";
import "./Navbar.css";

function Navbar() {
  return (
    <header className="navbar">
      <div className="nav-left">
        <div className="logo-circle">L</div>
        <span className="logo-text">Lumière.</span>
      </div>

      <nav className="nav-center">
        <a href="#">Makeup</a>
        <a href="#">Skincare</a>
        <a href="#">Haircare</a>
        <a href="#">Men Care</a>
      </nav>

      <div className="nav-right">
        <Search size={18} />
        <Heart size={18} />
        <ShoppingBag size={18} />
        <User size={18} />
        <ChevronDown size={16} />
      </div>
    </header>
  );
}

export default Navbar;