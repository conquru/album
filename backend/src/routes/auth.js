import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../upload.js";

const router = Router();

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Укажите имя пользователя и пароль" });
  }

  const existing = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: "Пользователь уже существует" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, avatar_url",
    [username, passwordHash]
  );

  const user = result.rows[0];
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "30d" });
  res.json({ token, user });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
  const user = result.rows[0];

  if (!user) {
    return res.status(401).json({ error: "Неверный логин или пароль" });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "Неверный логин или пароль" });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "30d" });
  res.json({
    token,
    user: { id: user.id, username: user.username, avatar_url: user.avatar_url },
  });
});

router.get("/me", requireAuth, async (req, res) => {
  const result = await pool.query(
    "SELECT id, username, avatar_url FROM users WHERE id = $1",
    [req.userId]
  );
  res.json(result.rows[0]);
});

router.put("/avatar", requireAuth, upload.single("avatar"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Файл не загружен" });
  }

  const avatarUrl = `/uploads/${req.file.filename}`;
  const result = await pool.query(
    "UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id, username, avatar_url",
    [avatarUrl, req.userId]
  );
  res.json(result.rows[0]);
});

export default router;
