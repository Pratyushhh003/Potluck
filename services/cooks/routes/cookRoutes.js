import express from "express";
import {
  createCookProfile,
  getCookProfile,
  getAllCooks,
  addFoodItem,
  getFoodItems,
  submitVerification,
  getVerificationStatus,
  rateCook,
  getCookRatings,
} from "../controllers/cookController.js";
import {
  getPopularityGraph,
  recordOrder,
} from "../controllers/graphController.js";
import { verifyToken } from "../middleware/auth.js";
import { upload } from "../config/multer.js";

const router = express.Router();

router.get("/food", getFoodItems);
router.post("/food", verifyToken, upload.single("image"), addFoodItem);
router.get("/graph", getPopularityGraph);
router.post("/graph/order", recordOrder);
router.post("/verify", verifyToken, submitVerification);
router.get("/verify/status", verifyToken, getVerificationStatus);
router.post("/rate", verifyToken, rateCook);
router.get("/ratings/:cookId", getCookRatings);
router.post("/profile", verifyToken, createCookProfile);
router.get("/profile/:id", getCookProfile);
router.get("/", getAllCooks);

export default router;
