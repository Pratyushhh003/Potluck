import express from "express";
import { calculateDiscount } from "../controllers/discountController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/calculate", verifyToken, calculateDiscount);

export default router;
