import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

const users = [];
const refreshTokens = new Map();

const signAccessToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

const signRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET + "_refresh", {
    expiresIn: "30d",
  });

export const register = async (req, res) => {
  const { name, email, password, role = "buyer" } = req.body;
  if (!name || !email || !password)
    return res
      .status(400)
      .json({ success: false, message: "All fields required" });

  const exists = users.find((u) => u.email === email);
  if (exists)
    return res
      .status(409)
      .json({ success: false, message: "Email already registered" });

  const hashed = await bcrypt.hash(password, 10);
  const user = { id: uuidv4(), name, email, password: hashed, role };
  users.push(user);

  const token = signAccessToken(user);
  const refreshToken = signRefreshToken(user.id);
  refreshTokens.set(user.id, refreshToken);

  res.status(201).json({
    success: true,
    token,
    refreshToken,
    user: { id: user.id, name, email, role },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.status(401).json({ success: false, message: "Wrong password" });

  const token = signAccessToken(user);
  const refreshToken = signRefreshToken(user.id);
  refreshTokens.set(user.id, refreshToken);

  res.json({
    success: true,
    token,
    refreshToken,
    user: { id: user.id, name: user.name, email, role: user.role },
  });
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res
      .status(401)
      .json({ success: false, message: "No refresh token" });

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET + "_refresh",
    );
    const user = users.find((u) => u.id === decoded.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const stored = refreshTokens.get(decoded.id);
    if (stored !== refreshToken)
      return res
        .status(403)
        .json({ success: false, message: "Invalid refresh token" });

    const newToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user.id);
    refreshTokens.set(user.id, newRefreshToken);

    res.json({ success: true, token: newToken, refreshToken: newRefreshToken });
  } catch {
    return res
      .status(403)
      .json({ success: false, message: "Invalid or expired refresh token" });
  }
};

export const getMe = (req, res) => {
  res.json({ success: true, user: req.user });
};

export const logout = (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_SECRET + "_refresh",
      );
      refreshTokens.delete(decoded.id);
    } catch {}
  }
  res.json({ success: true, message: "Logged out" });
};
