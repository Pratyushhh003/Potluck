import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import discountRoutes from "./routes/discountRoutes.js";

dotenv.config({ path: "../../.env" });

const app = express();
const PORT = process.env.DISCOUNT_PORT || 4003;

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/health", (req, res) =>
  res.json({ status: "ok", service: "ai-discount" }),
);
app.use("/api/discount", discountRoutes);

app.listen(PORT, () =>
  console.log(`AI discount service running on http://localhost:${PORT}`),
);
