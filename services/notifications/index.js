import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config({ path: "../../.env" });

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: "*" }));
app.use(express.json());

const PORT = process.env.NOTIFICATIONS_PORT || 4004;

const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("register", (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
    console.log("Client disconnected:", socket.id);
  });
});

app.get("/health", (req, res) =>
  res.json({ status: "ok", service: "notifications" }),
);

app.post("/notify", (req, res) => {
  const { userId, type, message, data } = req.body;
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit("notification", {
      type,
      message,
      data,
      timestamp: new Date(),
    });
    res.json({ success: true, delivered: true });
  } else {
    res.json({
      success: true,
      delivered: false,
      message: "User not connected",
    });
  }
});

app.post("/notify-all", (req, res) => {
  const { type, message, data } = req.body;
  io.emit("notification", { type, message, data, timestamp: new Date() });
  res.json({ success: true });
});

httpServer.listen(PORT, () => {
  console.log(`Notifications service running on http://localhost:${PORT}`);
});
