import { useState, useEffect } from "react";
import axios from "axios";
import { MapPin, Search } from "lucide-react";
import FoodCard from "../components/FoodCard";
import PopularityGraph from "../components/PopularityGraph";
import DeliveryMap from "../components/DeliveryMap";

export default function Home() {
  const [items, setItems] = useState([]);
  const [locality, setLocality] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:4002/api/cooks/food${locality ? `?locality=${locality}` : ""}`,
      );
      setItems(res.data.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [locality]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-[var(--text)] mb-2">
          Food near <span className="text-orange-500">you</span>
        </h1>
        <p className="text-[var(--text-muted)]">
          Home cooked meals from your neighbours
        </p>
      </div>

      <div className="flex items-center gap-3 mb-8 bg-[var(--card)] border border-[var(--border)] rounded-2xl px-4 py-3 max-w-sm">
        <MapPin size={16} className="text-orange-500 flex-shrink-0" />
        <input
          type="text"
          placeholder="Enter your locality..."
          value={locality}
          onChange={(e) => setLocality(e.target.value)}
          className="bg-transparent text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none flex-1"
        />
        <Search size={16} className="text-[var(--text-muted)]" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[var(--card)] border border-[var(--border)] rounded-2xl h-64 animate-pulse"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🍱</p>
          <p className="text-[var(--text-muted)]">
            No food listings found in your area yet.
          </p>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Try a different locality or check back later!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <FoodCard key={item._id} item={item} />
          ))}
        </div>
      )}

      <div className="mt-16">
        <h2 className="text-2xl font-bold text-[var(--text)] mb-6">
          Delivery <span className="text-orange-500">area</span>
        </h2>
        <DeliveryMap
          cookName="Local cooks"
          cookLocality={locality || "Delhi"}
          buyerLocality={locality || "Delhi"}
        />
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold text-[var(--text)] mb-6">
          Cook popularity <span className="text-orange-500">graph</span>
        </h2>
        <PopularityGraph locality={locality || "Delhi"} />
      </div>
    </div>
  );
}
