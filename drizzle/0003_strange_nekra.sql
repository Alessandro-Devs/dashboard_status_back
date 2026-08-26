ALTER TABLE "aprendizaje_snapshots" RENAME TO "aprendizaje";--> statement-breakpoint
ALTER TABLE "evaluacion_snapshots" RENAME TO "evaluacion";--> statement-breakpoint
ALTER TABLE "gestion_calidad_snapshots" RENAME TO "gestion_calidad";--> statement-breakpoint
ALTER TABLE "gestion_escolar_snapshots" RENAME TO "gestion_escolar";--> statement-breakpoint
ALTER TABLE "tutoria_formacion_snapshots" RENAME TO "tutoria_formacion";--> statement-breakpoint
ALTER TABLE "aprendizaje" DROP CONSTRAINT "aprendizaje_snapshots_snapshot_date_unique";--> statement-breakpoint
ALTER TABLE "evaluacion" DROP CONSTRAINT "evaluacion_snapshots_snapshot_date_unique";--> statement-breakpoint
ALTER TABLE "gestion_calidad" DROP CONSTRAINT "gestion_calidad_snapshots_snapshot_date_unique";--> statement-breakpoint
ALTER TABLE "gestion_escolar" DROP CONSTRAINT "gestion_escolar_snapshots_snapshot_date_unique";--> statement-breakpoint
ALTER TABLE "tutoria_formacion" DROP CONSTRAINT "tutoria_formacion_snapshots_snapshot_date_unique";--> statement-breakpoint
ALTER TABLE "aprendizaje" ADD CONSTRAINT "aprendizaje_snapshot_date_unique" UNIQUE("snapshot_date");--> statement-breakpoint
ALTER TABLE "evaluacion" ADD CONSTRAINT "evaluacion_snapshot_date_unique" UNIQUE("snapshot_date");--> statement-breakpoint
ALTER TABLE "gestion_calidad" ADD CONSTRAINT "gestion_calidad_snapshot_date_unique" UNIQUE("snapshot_date");--> statement-breakpoint
ALTER TABLE "gestion_escolar" ADD CONSTRAINT "gestion_escolar_snapshot_date_unique" UNIQUE("snapshot_date");--> statement-breakpoint
ALTER TABLE "tutoria_formacion" ADD CONSTRAINT "tutoria_formacion_snapshot_date_unique" UNIQUE("snapshot_date");