CREATE TABLE "aprendizaje_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"snapshot_date" date NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "aprendizaje_snapshots_snapshot_date_unique" UNIQUE("snapshot_date")
);
--> statement-breakpoint
CREATE TABLE "evaluacion_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"snapshot_date" date NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "evaluacion_snapshots_snapshot_date_unique" UNIQUE("snapshot_date")
);
--> statement-breakpoint
CREATE TABLE "gestion_calidad_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"snapshot_date" date NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gestion_calidad_snapshots_snapshot_date_unique" UNIQUE("snapshot_date")
);
--> statement-breakpoint
CREATE TABLE "gestion_escolar_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"snapshot_date" date NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gestion_escolar_snapshots_snapshot_date_unique" UNIQUE("snapshot_date")
);
--> statement-breakpoint
CREATE TABLE "tutoria_formacion_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"snapshot_date" date NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tutoria_formacion_snapshots_snapshot_date_unique" UNIQUE("snapshot_date")
);
--> statement-breakpoint
INSERT INTO "gestion_calidad_snapshots" ("snapshot_date", "data", "created_at", "updated_at")
SELECT "snapshot_date", "data"->'gestionCalidad', "created_at", "updated_at" FROM "dashboard_snapshots" WHERE "data" ? 'gestionCalidad';
--> statement-breakpoint
INSERT INTO "gestion_escolar_snapshots" ("snapshot_date", "data", "created_at", "updated_at")
SELECT "snapshot_date", "data"->'gestionEscolar', "created_at", "updated_at" FROM "dashboard_snapshots" WHERE "data" ? 'gestionEscolar';
--> statement-breakpoint
INSERT INTO "aprendizaje_snapshots" ("snapshot_date", "data", "created_at", "updated_at")
SELECT "snapshot_date", "data"->'aprendizaje', "created_at", "updated_at" FROM "dashboard_snapshots" WHERE "data" ? 'aprendizaje';
--> statement-breakpoint
INSERT INTO "evaluacion_snapshots" ("snapshot_date", "data", "created_at", "updated_at")
SELECT "snapshot_date", "data"->'evaluacion', "created_at", "updated_at" FROM "dashboard_snapshots" WHERE "data" ? 'evaluacion';
--> statement-breakpoint
INSERT INTO "tutoria_formacion_snapshots" ("snapshot_date", "data", "created_at", "updated_at")
SELECT "snapshot_date", "data"->'tutoriaFormacion', "created_at", "updated_at" FROM "dashboard_snapshots" WHERE "data" ? 'tutoriaFormacion';
