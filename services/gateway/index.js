import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { authLimiter, generalLimiter } from "./middleware/rateLimit.js";
import authRoutes from "./routes/authRoutes.js";
import cookRoutes from "./routes/cookRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config({ path: "../../.env" });

const app = express();
const PORT = process.env.GATEWAY_PORT || 4000;

app.use(helmet());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(generalLimiter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "gateway", timestamp: new Date() });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/cooks", cookRoutes);
app.use("/api/orders", orderRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`Gateway running on http://localhost:${PORT}`);
});
