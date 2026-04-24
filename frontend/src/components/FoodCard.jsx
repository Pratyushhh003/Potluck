import { ShoppingCart, Clock, MapPin, Star } from "lucide-react";
import toast from "react-hot-toast";

export default function FoodCard({ item }) {
  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((i) => i._id === item._id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success(`${item.name} added!`);
  };

  const expiresIn = item.expiresAt
    ? Math.max(0, Math.round((new Date(item.expiresAt) - new Date()) / 3600000))
    : null;

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden hover:border-orange-300 transition-all hover:shadow-lg hover:shadow-orange-500/5 group">
      <div className="h-44 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 flex items-center justify-center relative overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-5xl">🍱</span>
        )}
        {expiresIn !== null && expiresIn <= 2 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Clock size={10} /> {expiresIn}h left
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-[var(--text)] text-base">
            {item.name}
          </h3>
          <span className="text-orange-500 font-bold text-base">
            ₹{item.price}
          </span>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-2 line-clamp-2">
          {item.description}
        </p>
        <div className="flex items-center gap-1 mb-2">
          <MapPin size={11} className="text-[var(--text-muted)]" />
          <span className="text-xs text-[var(--text-muted)]">
            {item.locality}
          </span>
        </div>
        {item.cookRating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star size={12} className="text-orange-500 fill-orange-500" />
            <span className="text-xs text-[var(--text-muted)]">
              {item.cookRating?.toFixed(1)} rating
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span
            className={`text-xs px-2 py-1 rounded-full ${item.hygieneScore >= 0.75 ? "bg-green-50 dark:bg-green-950/50 text-green-600" : "bg-yellow-50 dark:bg-yellow-950/50 text-yellow-600"}`}
          >
            {item.hygieneScore >= 0.75
              ? "✓ Hygiene approved"
              : "⏳ Pending review"}
          </span>
          <button
            onClick={addToCart}
            className="flex items-center gap-1.5 bg-orange-500 text-white px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-orange-600 transition-colors"
          >
            <ShoppingCart size={12} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

