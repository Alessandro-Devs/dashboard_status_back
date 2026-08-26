import { boolean, date, integer, jsonb, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 80 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  updatedPassword: boolean("updated_password").default(true).notNull(),
  roleId: integer("role_id")
    .notNull()
    .default(1)
    .references(() => roles.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ one }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
}));

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

const sectionSnapshotColumns = () => ({
  id: serial("id").primaryKey(),
  snapshotDate: date("snapshot_date", { mode: "string" }).notNull().unique(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const gestionCalidadSnapshots = pgTable("gestion_calidad", sectionSnapshotColumns());
export const gestionEscolarSnapshots = pgTable("gestion_escolar", sectionSnapshotColumns());
export const aprendizajeSnapshots = pgTable("aprendizaje", sectionSnapshotColumns());
export const evaluacionSnapshots = pgTable("evaluacion", sectionSnapshotColumns());
export const tutoriaFormacionSnapshots = pgTable("tutoria_formacion", sectionSnapshotColumns());

export type GestionCalidadSnapshot = typeof gestionCalidadSnapshots.$inferSelect;
export type GestionEscolarSnapshot = typeof gestionEscolarSnapshots.$inferSelect;
export type AprendizajeSnapshot = typeof aprendizajeSnapshots.$inferSelect;
export type EvaluacionSnapshot = typeof evaluacionSnapshots.$inferSelect;
export type TutoriaFormacionSnapshot = typeof tutoriaFormacionSnapshots.$inferSelect;
