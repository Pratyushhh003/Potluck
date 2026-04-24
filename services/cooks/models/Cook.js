import mongoose from "mongoose";

const cookSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    bio: { type: String },
    locality: { type: String, required: true },
    phone: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified",
    },
    verificationDoc: { type: String },
    hygieneScore: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    popularityScore: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("Cook", cookSchema);
