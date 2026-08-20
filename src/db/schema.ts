import { date, jsonb, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

/**
 * Estado completo del dashboard para una fecha de corte.
 *
 * El contenido se mantiene como JSONB para que cada captura conserve todas
 * las secciones con la misma forma que el archivo local original.
 */
export const dashboardSnapshots = pgTable("dashboard_snapshots", {
  id: serial("id").primaryKey(),
  snapshotDate: date("snapshot_date", { mode: "string" }).notNull().unique(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type DashboardSnapshot = typeof dashboardSnapshots.$inferSelect;
export type NewDashboardSnapshot = typeof dashboardSnapshots.$inferInsert;
