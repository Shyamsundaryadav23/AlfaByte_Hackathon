import { query } from "../config/db.js";

export const getEventReports = async (req, res) => {
  const result = await query("SELECT * FROM event_statistics");
  res.json(result.rows);
};
