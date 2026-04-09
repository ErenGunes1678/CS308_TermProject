import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ShoppingBag, Tag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const initialItems = [
  {
    id: 1,
    brand: "LumaBelle",
    name: "Velvet Matte Lipstick",
    price: 28,
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1631214524020-3c1f1f0b7c1f?auto=format&fit=crop&w=300&q=80",
  },
];

export default function CartPage() {
  const [items, setItems] = useState(initialItems);
  const [promoCode, setPromoCode] = useState("");

  const shipping = items.length > 0 ? 5.99 : 0;

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const total = subtotal + shipping;

  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const increaseQty = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQty = (id) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity - 1) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleApplyPromo = () => {
    console.log("Promo code:", promoCode);
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <section className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-16">
          <div className="flex max-w-md flex-col items-center text-center">
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[28px] bg-[#fdecef]">
              <ShoppingBag className="h-8 w-8 text-[#ff7ea1]" strokeWidth={1.8} />
            </div>

            <h1 className="mb-3 text-[40px] font-semibold tracking-[-0.02em] text-[#08142f]">
              Your bag is empty
            </h1>

            <p className="mb-8 max-w-sm text-[15px] leading-7 text-[#8a93a5]">
              Looks like you haven&apos;t added anything yet. Let&apos;s find you
              something beautiful!
            </p>

            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff1f74] to-[#f53ea6] px-9 py-4 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.01]"
            >
              Start Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <section className="mx-auto max-w-7xl px-6 py-8 md:px-10 lg:px-12">
        <div className="mb-6 flex items-center gap-2 text-sm text-[#98a2b3]">
          <Link to="/" className="hover:text-[#08142f]">
            Home
          </Link>
          <span>›</span>
          <span className="text-[#08142f]">Shopping Bag</span>
        </div>

        <div className="mb-8 flex items-end gap-2">
          <h1 className="text-4xl font-semibold tracking-[-0.02em] text-[#08142f]">
            Shopping Bag
          </h1>
          <span className="pb-1 text-base text-[#98a2b3]">
            ({totalItems} items)
          </span>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.9fr_0.95fr]">
          <div>
            <div className="space-y-5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[20px] border border-[rgba(0,0,0,0.08)] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(16,24,40,0.04)]"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex gap-4">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#f6f7fb]">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="flex flex-col justify-between">
                        <div>
                          <p className="mb-1 text-sm font-medium text-[#ff3d7f]">
                            {item.brand}
                          </p>
                          <h3 className="text-lg font-medium text-[#08142f]">
                            {item.name}
                          </h3>
                        </div>

                        <div className="mt-3 flex items-center gap-3">
                          <button
                            onClick={() => decreaseQty(item.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(0,0,0,0.08)] bg-[#f7f7fa] text-lg text-[#08142f] transition hover:bg-[#efeff5]"
                          >
                            -
                          </button>

                          <span className="min-w-[12px] text-sm font-semibold text-[#08142f]">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => increaseQty(item.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(0,0,0,0.08)] bg-[#f7f7fa] text-lg text-[#08142f] transition hover:bg-[#efeff5]"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-6 md:flex-col md:items-end">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[#98a2b3] transition hover:text-[#08142f]"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <p className="text-[32px] font-semibold tracking-[-0.02em] text-[#08142f]">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#ff3d7f] transition hover:opacity-80"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>

          <aside className="h-fit rounded-[24px] border border-[rgba(0,0,0,0.08)] bg-white p-6 shadow-[0_12px_30px_rgba(16,24,40,0.05)]">
            <h2 className="mb-5 text-[28px] font-semibold tracking-[-0.02em] text-[#08142f]">
              Order Summary
            </h2>

            <div className="mb-6 flex gap-3">
              <div className="relative flex-1">
                <Tag className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b4bccb]" />
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Promo code"
                  className="h-12 w-full rounded-2xl border border-[rgba(0,0,0,0.06)] bg-[#f7f8fb] pl-11 pr-4 text-sm text-[#08142f] outline-none placeholder:text-[#98a2b3]"
                />
              </div>

              <button
                onClick={handleApplyPromo}
                className="rounded-2xl bg-[#08142f] px-6 text-sm font-semibold text-white transition hover:opacity-95"
              >
                Apply
              </button>
            </div>

            <div className="space-y-4 border-b border-[rgba(0,0,0,0.08)] pb-5 text-[15px]">
              <div className="flex items-center justify-between text-[#667085]">
                <span>Subtotal ({totalItems} items)</span>
                <span className="font-medium text-[#08142f]">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-[#667085]">
                <span>Shipping</span>
                <span className="font-medium text-[#08142f]">${shipping.toFixed(2)}</span>
              </div>

              <p className="text-sm text-[#9aa4b2]">
                Add $22.00 more for free shipping
              </p>
            </div>

            <div className="flex items-center justify-between py-5">
              <span className="text-[18px] font-semibold text-[#08142f]">Total</span>
              <span className="text-[36px] font-semibold tracking-[-0.03em] text-[#08142f]">
                ${total.toFixed(2)}
              </span>
            </div>

            <button className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff1f74] to-[#f53ea6] text-sm font-semibold text-white transition hover:scale-[1.01]">
              Sign In to Checkout
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="mt-4 text-center text-sm text-[#9aa4b2]">
              You need to be logged in to checkout
            </p>

            <div className="mt-5 flex items-center justify-center gap-6 text-sm text-[#98a2b3]">
              <span>🔒 Secure checkout</span>
              <span>💳 All cards accepted</span>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}