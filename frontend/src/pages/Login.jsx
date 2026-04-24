import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { UtensilsCrossed } from "lucide-react";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:4000/api/auth/login",
        form,
      );
      login(res.data.user, res.data.token, res.data.refreshToken);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
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
            Home cooked meals from your neighbours
          </p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8">
          <h1 className="text-xl font-semibold text-[var(--text)] mb-6">
            Welcome back
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-[var(--text-muted)] mb-1 block">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] mb-1 block">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors mt-2"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <p className="text-sm text-[var(--text-muted)] mt-5 text-center">
            No account?{" "}
            <Link
              to="/register"
              className="text-orange-500 hover:text-orange-400"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
