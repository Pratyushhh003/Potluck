import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    cookId: { type: String, required: true },
    buyerId: { type: String, required: true },
    orderId: { type: String, required: true, unique: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model("Rating", ratingSchema);
