import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

try {
  const result = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);

  console.log("Tables in database:");
  console.table(result.rows);
} catch (error) {
  console.error("DATABASE ERROR:");
  console.error(error);
} finally {
  await pool.end();
}