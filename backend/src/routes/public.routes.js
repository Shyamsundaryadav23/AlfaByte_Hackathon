import express from "express";
import { pool } from "../config/db.js";

const router = express.Router();

/**
 * Status lifecycle:
 * Created -> Live -> Completed -> Archived
 *
 * Auto rules:
 * - Archived stays Archived
 * - now < start_time => Created
 * - start_time <= now < end_time => Live
 * - now >= end_time => Completed
 * - now >= end_time + 7 days => Archived
 */
const computeStatus = (current, start, end) => {
  const now = new Date();
  const s = new Date(start);
  const e = new Date(end);

  if (current === "Archived") return "Archived";

  if (isNaN(s.getTime()) || isNaN(e.getTime())) {
    return current || "Created";
  }

  if (now < s) return "Created";
  if (now >= s && now < e) return "Live";

  const daysAfterEnd = (now - e) / (1000 * 60 * 60 * 24);
  if (daysAfterEnd >= 7) return "Archived";

  return "Completed";
};

// all active clubs
router.get("/clubs", async (req, res) => {
  try {
    const clubs = await pool.query("SELECT * FROM clubs WHERE status='Active'");
    res.json(clubs.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch clubs" });
  }
});

// single club
router.get("/clubs/:clubId", async (req, res) => {
  try {
    const { clubId } = req.params;
    const club = await pool.query(
      "SELECT * FROM clubs WHERE id=$1 AND status='Active'",
      [clubId]
    );

    if (club.rows.length === 0)
      return res.status(404).json({ error: "Club not found" });

    res.json(club.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch club" });
  }
});

// ✅ events of a club (public view only Created + Live)
router.get("/clubs/:clubId/events", async (req, res) => {
  try {
    const { clubId } = req.params;

    const events = await pool.query(
      `SELECT 
        e.*,
        COALESCE(rg.registered_count,0)::int AS registered_count
       FROM events e
       LEFT JOIN (
         SELECT event_id, COUNT(*) AS registered_count
         FROM registrations
         GROUP BY event_id
       ) rg ON rg.event_id = e.id
       WHERE e.club_id=$1
       ORDER BY e.start_time ASC`,
      [clubId]
    );

    // Auto-update event status before returning
    for (const ev of events.rows) {
      const nextStatus = computeStatus(ev.status, ev.start_time, ev.end_time);

      if (nextStatus !== ev.status) {
        await pool.query(
          "UPDATE events SET status=$1 WHERE id=$2 AND club_id=$3",
          [nextStatus, ev.id, clubId]
        );
        ev.status = nextStatus;
      }
    }

    // Public should only see upcoming + live
    const visible = events.rows.filter(
      (e) => e.status === "Created" || e.status === "Live"
    );

    return res.json(visible);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// ✅ single event details (public)
router.get("/events/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;

    const r = await pool.query(
      `SELECT 
        e.*,
        c.name AS club_name,
        COALESCE(rg.registered_count,0)::int AS registered_count
      FROM events e
      LEFT JOIN clubs c ON c.id = e.club_id
      LEFT JOIN (
        SELECT event_id, COUNT(*) AS registered_count
        FROM registrations
        GROUP BY event_id
      ) rg ON rg.event_id = e.id
      WHERE e.id=$1`,
      [eventId]
    );

    if (r.rows.length === 0)
      return res.status(404).json({ error: "Event not found" });

    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch event" });
  }
});

export default router;
