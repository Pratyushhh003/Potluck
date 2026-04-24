import axios from "axios";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

const getDiscount = async (signals) => {
  if (signals.isFirstOrder) {
    return {
      discountPercent: 25,
      reason: "First order",
      message: "25% off your first order — welcome to Potluck!",
    };
  }
  if (signals.cookTotalOrders < 5) {
    return {
      discountPercent: 15,
      reason: "New cook",
      message: "15% off — you're supporting a new cook in your area!",
    };
  }
  if (signals.hasExpiringItem) {
    return {
      discountPercent: 20,
      reason: "Expiring soon",
      message: "20% off — grab it before it's gone!",
    };
  }
  if (signals.orderStreak >= 5) {
    return {
      discountPercent: 10,
      reason: "Loyalty streak",
      message: "10% off — thanks for ordering 5 days in a row!",
    };
  }
  const hour = parseInt(signals.timeOfDay);
  if ((hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 21)) {
    return {
      discountPercent: 5,
      reason: "Peak hours",
      message: "5% off during peak hours!",
    };
  }
  return { discountPercent: 0, reason: "No discount", message: "" };
};

export const calculateDiscount = async (req, res) => {
  try {
    const {
      cartTotal,
      itemCount,
      isFirstOrder,
      orderStreak,
      cookTotalOrders,
      timeOfDay,
      hasExpiringItem,
    } = req.body;

    const signals = {
      cartTotal: cartTotal || 0,
      itemCount: itemCount || 1,
      isFirstOrder: isFirstOrder || false,
      orderStreak: orderStreak || 0,
      cookTotalOrders: cookTotalOrders || 0,
      timeOfDay: timeOfDay || new Date().getHours() + ":00",
      hasExpiringItem: hasExpiringItem || false,
    };

    const discount = await getDiscount(signals);
    const discountAmount = Math.round(
      (signals.cartTotal * discount.discountPercent) / 100,
    );
    const finalAmount = signals.cartTotal - discountAmount;

    res.json({
      success: true,
      discountPercent: discount.discountPercent,
      discountAmount,
      finalAmount,
      reason: discount.reason,
      message: discount.message,
    });
  } catch (err) {
    console.error("Discount engine error:", err.response?.data || err.message);
    res.json({
      success: true,
      discountPercent: 0,
      discountAmount: 0,
      finalAmount: req.body.cartTotal || 0,
      reason: "No discount applicable",
      message: "No discount available right now",
    });
  }
};
