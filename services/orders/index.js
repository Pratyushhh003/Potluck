import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config({ path: "../../.env" });

const app = express();
const PORT = process.env.ORDERS_PORT || 4001;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Orders service connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/health", (req, res) => res.json({ status: "ok", service: "orders" }));
app.use("/api/orders", orderRoutes);

app.listen(PORT, () =>
  console.log(`Orders service running on http://localhost:${PORT}`),
);
