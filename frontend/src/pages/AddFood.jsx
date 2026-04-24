import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Upload } from "lucide-react";

export default function AddFood() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    ingredients: "",
    locality: "",
    expiresAt: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) =>
        formData.append(key, value),
      );
      if (image) formData.append("image", image);

      await axios.post("http://localhost:4002/api/cooks/food", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Food item added!");
      navigate("/cook/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      key: "name",
      label: "Food name",
      placeholder: "e.g. Dal Makhani",
      type: "text",
    },
    {
      key: "description",
      label: "Description",
      placeholder: "Describe your dish...",
      type: "text",
    },
    { key: "price", label: "Price (₹)", placeholder: "0", type: "number" },
    {
      key: "category",
      label: "Category",
      placeholder: "e.g. North Indian, Snacks",
      type: "text",
    },
    {
      key: "ingredients",
      label: "Ingredients",
      placeholder: "rice, dal, spices (comma separated)",
      type: "text",
    },
    {
      key: "locality",
      label: "Locality",
      placeholder: "e.g. Mariam Nagar",
      type: "text",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <button
        onClick={() => navigate("/cook/dashboard")}
        className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] text-sm mb-8 transition-colors"
      >
        <ArrowLeft size={16} /> Back to dashboard
      </button>
      <h1 className="text-3xl font-bold text-[var(--text)] mb-2">
        Add food item
      </h1>
      <p className="text-[var(--text-muted)] mb-8">
        List your home cooked dish for your neighbours
      </p>
      <form
        onSubmit={handleSubmit}
        className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 space-y-5"
      >
        <div>
          <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">
            Food photo
          </label>
          <div
            className="border-2 border-dashed border-[var(--border)] rounded-xl p-6 text-center cursor-pointer hover:border-orange-400 transition-colors"
            onClick={() => document.getElementById("food-image").click()}
          >
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="w-full h-48 object-cover rounded-xl"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-[var(--text-muted)]">
                <Upload size={24} />
                <p className="text-sm">Click to upload food photo</p>
                <p className="text-xs">JPG, PNG, WEBP up to 5MB</p>
              </div>
            )}
          </div>
          <input
            id="food-image"
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="hidden"
          />
        </div>

        {fields.map(({ key, label, placeholder, type }) => (
          <div key={key}>
            <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">
              {label}
            </label>
            <input
              type={type}
              placeholder={placeholder}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-orange-400 transition-colors"
            />
          </div>
        ))}
        <div>
          <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">
            Expires at
          </label>
          <input
            type="datetime-local"
            value={form.expiresAt}
            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] focus:outline-none focus:border-orange-400 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
        >
          {loading ? "Adding and checking hygiene..." : "Add food item"}
        </button>
      </form>
    </div>
  );
}
