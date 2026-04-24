import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  ChefHat,
  Clock,
  CheckCircle,
  Package,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

const statusFlow = ["pending", "confirmed", "preparing", "delivered"];

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
    icon: Truck,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
};

export default function CookDashboard() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:4001/api/orders/cook", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, currentStatus) => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex === statusFlow.length - 1) return;
    const nextStatus = statusFlow[currentIndex + 1];
    setUpdating(orderId);
    try {
      await axios.patch(
        `http://localhost:4001/api/orders/${orderId}/status`,
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setOrders(
        orders.map((o) =>
          o._id === orderId ? { ...o, status: nextStatus } : o,
        ),
      );
      toast.success(`Order marked as ${nextStatus}!`);
      try {
        await axios.post("http://localhost:4004/notify", {
          userId: orders.find((o) => o._id === orderId)?.buyerId,
          type: "order_update",
          message: `Your order is now ${nextStatus}!`,
        });
      } catch {}
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const revenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + o.finalAmount, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text)]">
            Cook dashboard
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Manage your orders and listings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/cook/verify"
            className="flex items-center gap-2 border border-orange-500 text-orange-500 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-500/10 transition-colors"
          >
            <ShieldCheck size={16} /> Get verified
          </Link>
          <Link
            to="/cook/add-food"
            className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            <PlusCircle size={16} /> Add food item
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
          <p className="text-2xl mb-1">📦</p>
          <p className="text-2xl font-bold text-[var(--text)]">
            {pendingCount}
          </p>
          <p className="text-sm text-[var(--text-muted)]">Pending orders</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
          <p className="text-2xl mb-1">✅</p>
          <p className="text-2xl font-bold text-[var(--text)]">
            {deliveredCount}
          </p>
          <p className="text-sm text-[var(--text-muted)]">Delivered orders</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
          <p className="text-2xl mb-1">💰</p>
          <p className="text-2xl font-bold text-[var(--text)]">₹{revenue}</p>
          <p className="text-sm text-[var(--text-muted)]">Total revenue</p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-[var(--text)] mb-4">
        Incoming orders
      </h2>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-[var(--card)] border border-[var(--border)] rounded-2xl h-32 animate-pulse"
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-12 text-center">
          <ChefHat size={40} className="text-orange-500 mx-auto mb-4" />
          <p className="text-[var(--text)] font-medium mb-2">No orders yet</p>
          <p className="text-[var(--text-muted)] text-sm">
            Add food listings to start receiving orders!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const Icon = status.icon;
            const currentIndex = statusFlow.indexOf(order.status);
            const isLast = currentIndex === statusFlow.length - 1;
            const nextStatus = !isLast ? statusFlow[currentIndex + 1] : null;
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
                <div className="border-t border-[var(--border)] pt-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[var(--text-muted)]">
                      {order.deliveryAddress}
                    </p>
                    <p className="font-bold text-orange-500 mt-1">
                      ₹{order.finalAmount}
                    </p>
                  </div>
                  {isLast ? (
                    <span className="text-green-500 text-sm font-medium">
                      Completed
                    </span>
                  ) : (
                    <button
                      onClick={() => updateStatus(order._id, order.status)}
                      disabled={updating === order._id}
                      className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
                    >
                      {updating === order._id
                        ? "Updating..."
                        : `Mark as ${nextStatus}`}
                    </button>
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
