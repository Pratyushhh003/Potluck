import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  buyerId: { type: String, required: true },
  cookId: { type: String, required: true },
  items: [
    {
      foodItemId: String,
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  totalAmount: { type: Number, required: true },
  discountApplied: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'],
    default: 'pending',
  },
  locality: { type: String, required: true },
  deliveryAddress: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);