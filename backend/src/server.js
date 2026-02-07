import app from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./config/db.js";

const PORT = env.PORT || 5000;

// Start server
app.listen(PORT, async () => {
  try {
    // Test DB connection
    const client = await pool.connect();
    console.log("✅ PostgreSQL connected successfully");
    client.release();
  } catch (err) {
    console.error("❌ Failed to connect to PostgreSQL:", err.message);
    process.exit(1);
  }

  console.log(`🚀 Server running on port ${PORT}`);
});
