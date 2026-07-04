import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../upload.js";

const router = Router();

// Лента событий (все события, отсортированы по дате)
router.get("/", requireAuth, async (req, res) => {
  const result = await pool.query(
    `SELECT e.*, u.username, u.avatar_url
     FROM events e
     JOIN users u ON u.id = e.user_id
     ORDER BY e.event_date ASC NULLS LAST, e.created_at ASC`
  );
  res.json(result.rows);
});

// Одно событие с фотографиями
router.get("/:id", requireAuth, async (req, res) => {
  const eventResult = await pool.query(
    `SELECT e.*, u.username, u.avatar_url
     FROM events e
     JOIN users u ON u.id = e.user_id
     WHERE e.id = $1`,
    [req.params.id]
  );
  const event = eventResult.rows[0];
  if (!event) return res.status(404).json({ error: "Событие не найдено" });

  const photosResult = await pool.query(
    "SELECT id, image_url FROM event_photos WHERE event_id = $1 ORDER BY position ASC",
    [req.params.id]
  );

  res.json({ ...event, photos: photosResult.rows });
});

// Создание события с несколькими фото (первое фото становится обложкой)
router.post("/", requireAuth, upload.array("photos", 10), async (req, res) => {
  const { title, event_date, place, description } = req.body;
  if (!title) return res.status(400).json({ error: "Укажите название" });

  const files = req.files || [];
  const coverImage = files.length > 0 ? `/uploads/${files[0].filename}` : null;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const eventResult = await client.query(
      `INSERT INTO events (user_id, title, event_date, place, description, cover_image)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.userId, title, event_date || null, place || null, description || null, coverImage]
    );
    const event = eventResult.rows[0];

    for (let i = 0; i < files.length; i++) {
      await client.query(
        "INSERT INTO event_photos (event_id, image_url, position) VALUES ($1, $2, $3)",
        [event.id, `/uploads/${files[i].filename}`, i]
      );
    }

    await client.query("COMMIT");
    res.status(201).json(event);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Не удалось создать событие" });
  } finally {
    client.release();
  }
});

// Редактирование события (текстовые поля, опционально новые фото добавляются)
router.put("/:id", requireAuth, upload.array("photos", 10), async (req, res) => {
  const eventCheck = await pool.query("SELECT * FROM events WHERE id = $1", [req.params.id]);
  const event = eventCheck.rows[0];
  if (!event) return res.status(404).json({ error: "Событие не найдено" });
  if (event.user_id !== req.userId) return res.status(403).json({ error: "Нет доступа" });

  const { title, event_date, place, description } = req.body;
  const files = req.files || [];

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let coverImage = event.cover_image;
    if (files.length > 0 && !coverImage) {
      coverImage = `/uploads/${files[0].filename}`;
    }

    const updated = await client.query(
      `UPDATE events SET title = $1, event_date = $2, place = $3, description = $4, cover_image = $5
       WHERE id = $6 RETURNING *`,
      [
        title ?? event.title,
        event_date ?? event.event_date,
        place ?? event.place,
        description ?? event.description,
        coverImage,
        req.params.id,
      ]
    );

    if (files.length > 0) {
      const countResult = await client.query(
        "SELECT COUNT(*) FROM event_photos WHERE event_id = $1",
        [req.params.id]
      );
      let position = parseInt(countResult.rows[0].count, 10);

      for (const file of files) {
        await client.query(
          "INSERT INTO event_photos (event_id, image_url, position) VALUES ($1, $2, $3)",
          [req.params.id, `/uploads/${file.filename}`, position]
        );
        position++;
      }
    }

    await client.query("COMMIT");
    res.json(updated.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Не удалось обновить событие" });
  } finally {
    client.release();
  }
});

// Удаление фото из события
router.delete("/:id/photos/:photoId", requireAuth, async (req, res) => {
  const eventCheck = await pool.query("SELECT user_id FROM events WHERE id = $1", [req.params.id]);
  const event = eventCheck.rows[0];
  if (!event) return res.status(404).json({ error: "Событие не найдено" });
  if (event.user_id !== req.userId) return res.status(403).json({ error: "Нет доступа" });

  await pool.query("DELETE FROM event_photos WHERE id = $1 AND event_id = $2", [
    req.params.photoId,
    req.params.id,
  ]);
  res.status(204).end();
});

// Удаление события
router.delete("/:id", requireAuth, async (req, res) => {
  const eventCheck = await pool.query("SELECT user_id FROM events WHERE id = $1", [req.params.id]);
  const event = eventCheck.rows[0];
  if (!event) return res.status(404).json({ error: "Событие не найдено" });
  if (event.user_id !== req.userId) return res.status(403).json({ error: "Нет доступа" });

  await pool.query("DELETE FROM events WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

export default router;
