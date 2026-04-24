import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema(
  {
    cookId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    ingredients: [String],
    imageUrl: { type: String },
    hygieneScore: { type: Number, default: 0 },
    status: {
  type: String,
  enum: ['pending', 'approved', 'rejected'],
  default: 'approved',
  },
    expiresAt: { type: Date, required: true },
    locality: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model('FoodItem', foodItemSchema, 'fooditems');