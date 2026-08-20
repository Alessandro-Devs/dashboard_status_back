import { Client } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL no está definida");
}

const client = new Client({ connectionString: process.env.DATABASE_URL });

try {
  await client.connect();
  const { rows } = await client.query(
    `SELECT snapshot_date, jsonb_object_keys(data) AS section
     FROM dashboard_snapshots
     WHERE snapshot_date = $1
     ORDER BY section`,
    ["2026-08-13"],
  );

  if (rows.length === 0) {
    throw new Error("No se encontró la instantánea del 2026-08-13");
  }

  console.log(`Instantánea verificada: ${rows[0].snapshot_date} (${rows.length} secciones).`);
} finally {
  await client.end();
}
