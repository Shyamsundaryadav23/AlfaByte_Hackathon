import { pool } from "../config/db.js";

/**
 * GET template
 */
export const getCertificateTemplate = async (req, res) => {
  const { eventId } = req.params;

  const r = await pool.query(
    `SELECT template_html FROM certificate_templates WHERE event_id=$1`,
    [eventId]
  );

  if (!r.rows.length) return res.json({ template_html: "" });
  return res.json(r.rows[0]);
};

/**
 * SAVE / UPDATE template
 */
export const saveCertificateTemplate = async (req, res) => {
  const { eventId } = req.params;
  const { template_html } = req.body;

  if (!template_html)
    return res.status(400).json({ error: "Template HTML required" });

  await pool.query(
    `
    INSERT INTO certificate_templates (event_id, template_html)
    VALUES ($1,$2)
    ON CONFLICT (event_id)
    DO UPDATE SET template_html=$2, updated_at=NOW()
    `,
    [eventId, template_html]
  );

  res.json({ message: "Certificate template saved" });
};
