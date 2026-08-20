import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL no está definida");
}

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.resolve(
  currentDirectory,
  "../../dashboard_status_front/src/data/dashboardDatabase.js",
);
const source = fs.readFileSync(sourcePath, "utf8");
const expression = source
  .replace(/^export const dashboardDatabase\s*=\s*/, "")
  .replace(/\s*export default dashboardDatabase;\s*$/, "")
  .replace(/;\s*$/, "");
const dashboardData = Function(`"use strict"; return (${expression});`)();
const snapshotDate = dashboardData?.metadata?.fechaCorte;

if (!/^\d{4}-\d{2}-\d{2}$/.test(snapshotDate || "")) {
  throw new Error("metadata.fechaCorte debe tener el formato YYYY-MM-DD");
}

async function seed() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    await client.query(
      `INSERT INTO dashboard_snapshots (snapshot_date, data)
       VALUES ($1, $2::jsonb)
       ON CONFLICT (snapshot_date)
       DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
      [snapshotDate, JSON.stringify(dashboardData)],
    );
    console.log(`Instantánea del ${snapshotDate} cargada correctamente.`);
  } finally {
    await client.end();
  }
}

seed().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
