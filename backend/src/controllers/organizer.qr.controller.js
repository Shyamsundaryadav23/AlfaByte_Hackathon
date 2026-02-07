// controllers/organizer.qr.controller.js
import crypto from "crypto";
import { pool } from "../config/db.js";

const MIN_30 = 30 * 60 * 1000;

function startOfDay(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d;
}

function endOfDay(dateStr) {
  const d = new Date(dateStr + "T23:59:59.999");
  return d;
}

// Build day window for multi-day event:
// first day: start_time -> endOfDay
// middle days: startOfDay -> endOfDay
// last day: startOfDay -> end_time
function getDayWindow(eventStart, eventEnd, dayStr) {
  const s = new Date(eventStart);
  const e = new Date(eventEnd);

  const dayStart0 = startOfDay(dayStr);
  const dayEnd0 = endOfDay(dayStr);

  const startKey = s.toISOString().slice(0, 10);
  const endKey = e.toISOString().slice(0, 10);

  // single day
  if (startKey === endKey && dayStr === startKey) {
    return { dayStart: s, dayEnd: e };
  }

  if (dayStr === startKey) return { dayStart: s, dayEnd: dayEnd0 };
  if (dayStr === endKey) return { dayStart: dayStart0, dayEnd: e };

  // middle days
  return { dayStart: dayStart0, dayEnd: dayEnd0 };
}

/**
 * POST /api/organizers/events/:eventId/qr/open
 * body: { qr_type: "ENTRY"|"EXIT", day: "YYYY-MM-DD" }
 *
 * RULES:
 * ENTRY QR visible: dayStart - 30min  ... dayEnd
 * EXIT  QR visible: dayEnd - 30min    ... dayEnd + 30min
 */
export const openEventQr = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { qr_type, day } = req.body;

    if (!qr_type || !["ENTRY", "EXIT"].includes(qr_type)) {
      return res.status(400).json({ error: "qr_type must be ENTRY or EXIT" });
    }
    if (!day) return res.status(400).json({ error: "day (YYYY-MM-DD) required" });

    // Ensure organizer belongs to same club that owns the event
    const { clubId } = req.user;

    const ev = await pool.query(
      `SELECT id, club_id, start_time, end_time
       FROM events
       WHERE id=$1`,
      [eventId]
    );
    if (ev.rows.length === 0) return res.status(404).json({ error: "Event not found" });

    const event = ev.rows[0];
    if (String(event.club_id) !== String(clubId)) {
      return res.status(403).json({ error: "Not allowed for this club event" });
    }

    // validate day is within event date range
    const startKey = new Date(event.start_time).toISOString().slice(0, 10);
    const endKey = new Date(event.end_time).toISOString().slice(0, 10);
    if (day < startKey || day > endKey) {
      return res.status(400).json({ error: "Selected day not within event range" });
    }

    const { dayStart, dayEnd } = getDayWindow(event.start_time, event.end_time, day);
    const now = new Date();

    // enforce 30-minute rule server-side
    if (qr_type === "ENTRY") {
      const openFrom = new Date(dayStart.getTime() - MIN_30);
      const openTill = new Date(dayEnd.getTime());
      if (now < openFrom || now > openTill) {
        return res.status(400).json({
          error: "ENTRY QR allowed only 30 minutes before day start until day end",
        });
      }
    }

    if (qr_type === "EXIT") {
      const openFrom = new Date(dayEnd.getTime() - MIN_30);
      const openTill = new Date(dayEnd.getTime() + MIN_30);
      if (now < openFrom || now > openTill) {
        return res.status(400).json({
          error: "EXIT QR allowed only 30 minutes before day end until 30 minutes after",
        });
      }
    }

    // Expire QR after 40 minutes (safe). You can change this.
    const expiresAt = new Date(now.getTime() + 40 * 60 * 1000);
    const token = crypto.randomBytes(18).toString("hex");

    // Deactivate old session for same event+day+type
    await pool.query(
      `UPDATE event_qr_sessions
       SET is_active=false
       WHERE event_id=$1 AND day=$2 AND qr_type=$3`,
      [eventId, day, qr_type]
    );

    // Create new session
    await pool.query(
      `INSERT INTO event_qr_sessions(event_id, day, qr_type, token, expires_at, is_active)
       VALUES ($1,$2,$3,$4,$5,true)`,
      [eventId, day, qr_type, token, expiresAt]
    );

    return res.json({
      message: "QR opened",
      token,
      expiresAt,
      qr_type,
      day,
    });
  } catch (err) {
    console.error("openEventQr error:", err);
    return res.status(500).json({ error: "Failed to open QR" });
  }
};
