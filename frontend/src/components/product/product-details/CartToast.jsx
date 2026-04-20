import { Link } from 'react-router-dom';

function CartToast({ cartToast }) {
  if (!cartToast) return null;

  return (
    <div className="pdp-cart-toast" role="status" aria-live="polite">
      <div>
        <p className="pdp-cart-toast__label">Added to bag</p>
        <p className="pdp-cart-toast__name">{cartToast.productName}</p>
        <p className="pdp-cart-toast__meta">
          Qty {cartToast.quantity} · ${cartToast.totalPrice.toFixed(2)}
        </p>
      </div>

      <Link to="/cart" className="pdp-cart-toast__btn">
        View Bag
      </Link>
    </div>
  );
}

export default CartToast;
