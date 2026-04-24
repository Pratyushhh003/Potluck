import Cook from "../models/Cook.js";
import FoodItem from "../models/FoodItem.js";

export const createCookProfile = async (req, res) => {
  try {
    const { name, bio, locality, phone } = req.body;
    const existing = await Cook.findOne({ userId: req.user.id });
    if (existing)
      return res
        .status(409)
        .json({ success: false, message: "Profile already exists" });
    const cook = await Cook.create({
      userId: req.user.id,
      name,
      bio,
      locality,
      phone,
    });
    res.status(201).json({ success: true, cook });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCookProfile = async (req, res) => {
  try {
    const cook = await Cook.findOne({ userId: req.params.id });
    if (!cook)
      return res
        .status(404)
        .json({ success: false, message: "Cook not found" });
    res.json({ success: true, cook });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllCooks = async (req, res) => {
  try {
    const { locality } = req.query;
    const filter = locality
      ? { locality, isVerified: true }
      : { isVerified: true };
    const cooks = await Cook.find(filter).sort({ popularityScore: -1 });
    res.json({ success: true, cooks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addFoodItem = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      ingredients,
      expiresAt,
      locality,
    } = req.body;
    const imageUrl = req.file?.path || null;

    let hygieneScore = 0;
    let status = "pending";

    if (imageUrl) {
      try {
        const cnnRes = await fetch(
          process.env.CNN_SERVICE_URL + "/predict-url",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl }),
          },
        );
        const result = await cnnRes.json();
        hygieneScore = result.hygieneScore || 0;
        status =
          result.status === "approved"
            ? "approved"
            : result.status === "review"
              ? "pending"
              : "rejected";
      } catch {
        status = "approved";
      }
    } else {
      status = "approved";
    }

    const foodItem = await FoodItem.create({
      cookId: req.user.id,
      name,
      description,
      price,
      category,
      ingredients: Array.isArray(ingredients)
        ? ingredients
        : ingredients.split(",").map((i) => i.trim()),
      expiresAt,
      locality,
      imageUrl,
      hygieneScore,
      status,
    });
    res.status(201).json({ success: true, foodItem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
export const getFoodItems = async (req, res) => {
  try {
    const { locality } = req.query;
    const filter = { status: "approved" };
    if (locality) filter.locality = locality;
    const items = await FoodItem.find(filter).sort({ createdAt: -1 });
    console.log("Filter:", filter, "Items found:", items.length);
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
export const submitVerification = async (req, res) => {
  try {
    const { phone, bio, locality } = req.body;
    let cook = await Cook.findOne({ userId: req.user.id });
    if (!cook) {
      cook = await Cook.create({
        userId: req.user.id,
        name: req.user.name || "Cook",
        phone,
        bio,
        locality,
        verificationStatus: "pending",
      });
    } else {
      cook.phone = phone;
      cook.bio = bio;
      cook.locality = locality;
      cook.verificationStatus = "pending";
      await cook.save();
    }
    res.json({ success: true, cook });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getVerificationStatus = async (req, res) => {
  try {
    const cook = await Cook.findOne({ userId: req.user.id });
    if (!cook) return res.json({ success: true, status: "unverified" });
    res.json({ success: true, status: cook.verificationStatus, cook });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
import Rating from "../models/Rating.js";

export const rateCook = async (req, res) => {
  try {
    const { cookId, orderId, rating, review } = req.body;
    const existing = await Rating.findOne({ orderId });
    if (existing)
      return res
        .status(409)
        .json({ success: false, message: "Already rated this order" });

    await Rating.create({
      cookId,
      buyerId: req.user.id,
      orderId,
      rating,
      review,
    });

    const ratings = await Rating.find({ cookId });
    const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    await Cook.findOneAndUpdate(
      { userId: cookId },
      { rating: Math.round(avg * 10) / 10, totalRatings: ratings.length },
    );

    res.json({ success: true, message: "Rating submitted!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCookRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ cookId: req.params.cookId })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ success: true, ratings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
