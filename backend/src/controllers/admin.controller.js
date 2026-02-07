import {pool} from "../config/db.js";

/* ============================
   GET ALL CLUBS
============================ */
export const getAllClubs = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM clubs ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching clubs:", error);
    res.status(500).json({ error: "Failed to fetch clubs" });
  }
};

/* ============================
   ADD NEW CLUB
============================ */
export const adminCreateClub = async (req, res) => {
  try {
    const { name, category, description } = req.body;

    // ✅ Check if club already exists
    const existingClub = await pool.query(
      "SELECT * FROM clubs WHERE LOWER(name) = LOWER($1)",
      [name]
    );

    if (existingClub.rows.length > 0) {
      return res.status(400).json({
        error: "Club already exists. Duplicate not allowed.",
      });
    }

    // If image uploaded
   const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;


    // ✅ Insert new club
    const result = await pool.query(
      `INSERT INTO clubs (name, category, description, image)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, category, description, imageUrl]
    );
  
    res.json({
      message: "Club added successfully",
      club: result.rows[0],
    });
  } catch (error) {
    console.error("Error adding club:", error);

    res.status(500).json({
      error: "Failed to add club",
    });
  }
};

export const getClubById = async (req, res) => {
  try {
    const { id } = req.params;
    const r = await pool.query("SELECT id, name FROM clubs WHERE id=$1", [id]);
    if (r.rows.length === 0) return res.status(404).json({ error: "Club not found" });
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



/* ============================
   TOGGLE CLUB STATUS
============================ */
export const toggleClubStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch current status
    const club = await pool.query(
      "SELECT status FROM clubs WHERE id = $1",
      [id]
    );

    if (club.rows.length === 0) {
      return res.status(404).json({ error: "Club not found" });
    }

    const currentStatus = club.rows[0].status;
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

    await pool.query(
      "UPDATE clubs SET status = $1 WHERE id = $2",
      [newStatus, id]
    );

    res.json({ message: "Club status updated successfully" });
  } catch (error) {
    console.error("Error toggling status:", error);
    res.status(500).json({ error: "Failed to toggle club status" });
  }
};

/* ============================
   AUDIT LOGS (OPTIONAL)
============================ */
export const getAuditLogs = async (req, res) => {
  res.json([]);
};
