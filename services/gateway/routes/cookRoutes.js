import express from "express";
import { verifyToken } from "../middleware/auth.js";
const router = express.Router();

router.get("/", verifyToken, (req, res) => {
  res.json({ success: true, message: "Route working", user: req.user });
});

export default router;
