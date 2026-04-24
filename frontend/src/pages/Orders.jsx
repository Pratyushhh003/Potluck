import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Star,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  preparing: {
    label: "Preparing",
    icon: Package,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingOrder, setRatingOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [rated, setRated] = useState({});
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("http://localhost:4001/api/orders/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data.orders || []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchOrders();
  }, [token]);

  const reorder = (order) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    order.items.forEach((item) => {
      const existing = cart.find((i) => i._id === item.foodItemId);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        cart.push({
          _id: item.foodItemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          cookId: order.cookId,
          locality: order.locality,
        });
      }
    });
    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success("Items added to cart!");
    navigate("/cart");
  };

  const submitRating = async (order) => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(
        "http://localhost:4002/api/cooks/rate",
        { cookId: order.cookId, orderId: order._id, rating, review },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Rating submitted!");
      setRated({ ...rated, [order._id]: rating });
      setRatingOrder(null);
      setRating(0);
      setReview("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-[var(--card)] border border-[var(--border)] rounded-2xl h-32 animate-pulse"
            />
          ))}
        </div>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-[var(--text)] mb-2">
        Your orders
      </h1>
      <p className="text-[var(--text-muted)] text-sm mb-8">
        Track your food orders
      </p>

      {orders.length === 0 ? (
        <div className="text-center py-24">
          <Truck
            size={48}
            className="text-[var(--text-muted)] mx-auto mb-4 opacity-30"
          />
          <p className="text-[var(--text-muted)]">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const Icon = status.icon;
            const isDelivered = order.status === "delivered";
            const hasRated = rated[order._id];
            return (
              <div
                key={order._id}
                className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-[var(--text)]">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${status.bg} ${status.color}`}
                  >
                    <Icon size={12} /> {status.label}
                  </span>
                </div>
                <div className="space-y-1 mb-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-[var(--text-muted)]">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="text-[var(--text)]">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[var(--border)] pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[var(--text-muted)]">
                      {order.deliveryAddress}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => reorder(order)}
                        className="flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-400 border border-orange-500/30 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        <RotateCcw size={12} /> Reorder
                      </button>
                      <span className="font-bold text-orange-500">
                        ₹{order.finalAmount}
                      </span>
                    </div>
                  </div>
                  {isDelivered && !hasRated && ratingOrder !== order._id && (
                    <button
                      onClick={() => setRatingOrder(order._id)}
                      className="mt-3 flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-400 transition-colors"
                    >
                      <Star size={14} /> Rate this order
                    </button>
                  )}
                  {hasRated && (
                    <div className="mt-3 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          className={
                            s <= hasRated
                              ? "text-orange-500 fill-orange-500"
                              : "text-[var(--text-muted)]"
                          }
                        />
                      ))}
                      <span className="text-xs text-[var(--text-muted)] ml-1">
                        Your rating
                      </span>
                    </div>
                  )}
                  {ratingOrder === order._id && (
                    <div className="mt-4 bg-[var(--bg)] rounded-xl p-4 space-y-3">
                      <p className="text-sm font-medium text-[var(--text)]">
                        Rate your experience
                      </p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} onClick={() => setRating(s)}>
                            <Star
                              size={24}
                              className={
                                s <= rating
                                  ? "text-orange-500 fill-orange-500"
                                  : "text-[var(--text-muted)]"
                              }
                            />
                          </button>
                        ))}
                      </div>
                      <textarea
                        placeholder="Write a review (optional)..."
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        rows={2}
                        className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2 text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-orange-400 transition-colors resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => submitRating(order)}
                          disabled={submitting}
                          className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
                        >
                          {submitting ? "Submitting..." : "Submit rating"}
                        </button>
                        <button
                          onClick={() => {
                            setRatingOrder(null);
                            setRating(0);
                            setReview("");
                          }}
                          className="border border-[var(--border)] text-[var(--text-muted)] px-4 py-2 rounded-xl text-sm hover:text-[var(--text)] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
