import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { UtensilsCrossed, ShoppingBag, ChefHat } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer",
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:4000/api/auth/register",
        form,
      );
      login(res.data.user, res.data.token, res.data.refreshToken);
      toast.success("Account created!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-orange-500 text-2xl font-bold mb-2">
            <UtensilsCrossed size={28} /> Potluck
          </div>
          <p className="text-[var(--text-muted)] text-sm">
            Join your neighbourhood food community
          </p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8">
          <h1 className="text-xl font-semibold text-[var(--text)] mb-6">
            Create account
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              ["name", "Full name", "text", "Your name"],
              ["email", "Email", "email", "you@example.com"],
              ["password", "Password", "password", "••••••••"],
            ].map(([field, label, type, placeholder]) => (
              <div key={field}>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">
                  {label}
                </label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[field]}
                  onChange={(e) =>
                    setForm({ ...form, [field]: e.target.value })
                  }
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] focus:outline-none focus:border-orange-400 transition-colors"
                />
              </div>
            ))}
            <div>
              <label className="text-xs text-[var(--text-muted)] mb-2 block">
                I want to
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: "buyer" })}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm transition-all ${form.role === "buyer" ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-500" : "border-[var(--border)] text-[var(--text-muted)]"}`}
                >
                  <ShoppingBag size={20} />
                  Buy food
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: "cook" })}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm transition-all ${form.role === "cook" ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-500" : "border-[var(--border)] text-[var(--text-muted)]"}`}
                >
                  <ChefHat size={20} />
                  Sell food
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors mt-2"
            >
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>
          <p className="text-sm text-[var(--text-muted)] mt-5 text-center">
            Have an account?{" "}
            <Link to="/login" className="text-orange-500 hover:text-orange-400">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
