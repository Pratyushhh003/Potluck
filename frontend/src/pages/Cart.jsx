import { useState, useEffect } from "react";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [address, setAddress] = useState("");
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
  }, []);

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const remove = (id) => {
    const updated = cart.filter((i) => i._id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    setDiscount(null);
  };

  const fetchDiscount = async () => {
    if (!token || total === 0) return;
    setLoading(true);
    try {
      const hour = new Date().getHours();
      const res = await axios.post(
        "http://localhost:4003/api/discount/calculate",
        {
          cartTotal: total,
          itemCount: cart.length,
          isFirstOrder: true,
          orderStreak: 0,
          cookTotalOrders: 3,
          timeOfDay: `${hour}:00`,
          hasExpiringItem: false,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setDiscount(res.data);
    } catch {
      setDiscount(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (total > 0 && token) fetchDiscount();
  }, [total, token]);

  const placeOrder = async () => {
    if (!address.trim()) {
      toast.error("Please enter your delivery address");
      return;
    }
    if (cart.length === 0) return;
    setOrdering(true);
    try {
      const cookId = cart[0].cookId || "unknown";
      const locality = cart[0].locality || "unknown";
      const items = cart.map((i) => ({
        foodItemId: i._id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      }));
      await axios.post(
        "http://localhost:4001/api/orders",
        {
          cookId,
          items,
          totalAmount: total,
          discountApplied: discount?.discountAmount || 0,
          finalAmount: discount?.finalAmount || total,
          locality,
          deliveryAddress: address,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      try {
        await axios.post("http://localhost:4004/notify", {
          userId: cart[0].cookId,
          type: "new_order",
          message: `New order! ${items.length} item(s) — ₹${discount?.finalAmount || total}`,
        });
      } catch {}
      localStorage.removeItem("cart");
      setCart([]);
      toast.success("Order placed successfully!");
      navigate("/orders");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Your cart</h1>
      <p className="text-[var(--text-muted)] text-sm mb-8">
        Review your items before ordering
      </p>

      {discount && discount.discountPercent > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 mb-6">
          <p className="text-orange-500 font-medium text-sm">
            {discount.message}
          </p>
          <p className="text-orange-400 text-xs mt-1">
            You save ₹{discount.discountAmount}
          </p>
        </div>
      )}

      {cart.length === 0 ? (
        <div className="text-center py-24">
          <ShoppingBag
            size={48}
            className="text-[var(--text-muted)] mx-auto mb-4 opacity-30"
          />
          <p className="text-[var(--text-muted)]">Your cart is empty</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 text-orange-500 text-sm hover:text-orange-400 transition-colors"
          >
            Browse food listings
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {cart.map((item) => (
              <div
                key={item._id}
                className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-[var(--text)]">{item.name}</p>
                  <p className="text-sm text-[var(--text-muted)]">
                    ₹{item.price} × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-orange-500">
                    ₹{item.price * item.quantity}
                  </span>
                  <button
                    onClick={() => remove(item._id)}
                    className="text-[var(--text-muted)] hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
            <div className="mb-4">
              <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">
                Delivery address
              </label>
              <input
                type="text"
                placeholder="Enter your full address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>

            <div className="space-y-2 mb-4 border-t border-[var(--border)] pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Subtotal</span>
                <span className="text-[var(--text)]">₹{total}</span>
              </div>
              {discount && discount.discountPercent > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-500">
                    Discount ({discount.discountPercent}%)
                  </span>
                  <span className="text-green-500">
                    − ₹{discount.discountAmount}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-semibold pt-2 border-t border-[var(--border)]">
                <span className="text-[var(--text)]">Total</span>
                <span className="text-orange-500 text-lg">
                  ₹{discount ? discount.finalAmount : total}
                </span>
              </div>
            </div>

            {loading && (
              <p className="text-xs text-[var(--text-muted)] text-center mb-3">
                Calculating your discount...
              </p>
            )}

            <button
              onClick={placeOrder}
              disabled={ordering}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {ordering ? (
                "Placing order..."
              ) : (
                <>
                  <span>Place order</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
