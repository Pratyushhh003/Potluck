import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, Clock, CheckCircle, ArrowLeft } from "lucide-react";

export default function CookVerification() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [form, setForm] = useState({ phone: "", bio: "", locality: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(
          "http://localhost:4002/api/cooks/verify/status",
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setStatus(res.data.status);
        if (res.data.cook) {
          setForm({
            phone: res.data.cook.phone || "",
            bio: res.data.cook.bio || "",
            locality: res.data.cook.locality || "",
          });
        }
      } catch {}
    };
    if (token) fetchStatus();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:4002/api/cooks/verify", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Verification submitted!");
      setStatus("pending");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <button
        onClick={() => navigate("/cook/dashboard")}
        className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] text-sm mb-8 transition-colors"
      >
        <ArrowLeft size={16} /> Back to dashboard
      </button>

      <h1 className="text-3xl font-bold text-[var(--text)] mb-2">
        Cook verification
      </h1>
      <p className="text-[var(--text-muted)] mb-8">
        Get verified to build trust with buyers
      </p>

      {status === "verified" ? (
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          <p className="text-green-500 font-bold text-xl mb-2">
            You are verified!
          </p>
          <p className="text-[var(--text-muted)] text-sm">
            Your profile shows a verified badge to buyers
          </p>
        </div>
      ) : status === "pending" ? (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-8 text-center">
          <Clock size={48} className="text-yellow-500 mx-auto mb-4" />
          <p className="text-yellow-500 font-bold text-xl mb-2">Under review</p>
          <p className="text-[var(--text-muted)] text-sm">
            Your verification is being reviewed. Usually takes 24 hours.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 space-y-5"
        >
          <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-2">
            <ShieldCheck size={20} className="text-orange-500 flex-shrink-0" />
            <p className="text-sm text-orange-500">
              Fill in your details to get a verified badge on your profile
            </p>
          </div>
          {[
            {
              key: "phone",
              label: "Phone number",
              placeholder: "+91 98765 43210",
            },
            {
              key: "locality",
              label: "Locality",
              placeholder: "e.g. Mariam Nagar, Ghaziabad",
            },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">
                {label}
              </label>
              <input
                type="text"
                placeholder={placeholder}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">
              About you
            </label>
            <textarea
              placeholder="Tell buyers about yourself and your cooking..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-orange-400 transition-colors resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {loading ? "Submitting..." : "Submit for verification"}
          </button>
        </form>
      )}
    </div>
  );
}
