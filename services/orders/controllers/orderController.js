import Order from '../models/Order.js';

export const createOrder = async (req, res) => {
  try {
    const { cookId, items, totalAmount, discountApplied, finalAmount, locality, deliveryAddress } = req.body;
    const order = await Order.create({
      buyerId: req.user.id,
      cookId,
      items,
      totalAmount,
      discountApplied: discountApplied || 0,
      finalAmount,
      locality,
      deliveryAddress,
      status: 'pending'
    });
    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCookOrders = async (req, res) => {
  try {
    const orders = await Order.find({ cookId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};