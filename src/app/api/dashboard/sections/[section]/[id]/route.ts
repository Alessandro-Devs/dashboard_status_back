import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aprendizajeSnapshots, evaluacionSnapshots, gestionCalidadSnapshots, gestionEscolarSnapshots, tutoriaFormacionSnapshots } from "@/db/schema";

const tables = { gestionCalidad: gestionCalidadSnapshots, gestionEscolar: gestionEscolarSnapshots, aprendizaje: aprendizajeSnapshots, evaluacion: evaluacionSnapshots, tutoriaFormacion: tutoriaFormacionSnapshots } as const;
type Section = keyof typeof tables;
const origin = process.env.FRONTEND_URL ?? "http://localhost:5173";
const cors = (value?: string | null) => ({ "Access-Control-Allow-Origin": value ?? origin, "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", Vary: "Origin" });
const validSection = (value: string): value is Section => value in tables;
const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object" && !Array.isArray(value);

async function params(context: { params: Promise<{ section: string; id: string }> }) {
  const values = await context.params;
  const id = Number(values.id);
  return { section: values.section, id: Number.isInteger(id) && id > 0 ? id : null };
}

export async function GET(request: NextRequest, context: { params: Promise<{ section: string; id: string }> }) {
  const { section, id } = await params(context);
  if (!validSection(section) || !id) return NextResponse.json({ error: "La sección o el identificador no son válidos." }, { status: 400, headers: cors(request.headers.get("origin")) });
  const table = tables[section];
  const [record] = await db.select({ id: table.id, date: table.snapshotDate, createdAt: table.createdAt, updatedAt: table.updatedAt, data: table.data }).from(table).where(eq(table.id, id)).limit(1);
  return record ? NextResponse.json({ record }, { headers: cors(request.headers.get("origin")) }) : NextResponse.json({ error: "El registro no existe." }, { status: 404, headers: cors(request.headers.get("origin")) });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ section: string; id: string }> }) {
  const { section, id } = await params(context);
  if (!validSection(section) || !id) return NextResponse.json({ error: "La sección o el identificador no son válidos." }, { status: 400, headers: cors(request.headers.get("origin")) });
  try {
    const body: unknown = await request.json();
    const metadata = object(body) && object(body.metadata) ? body.metadata : null;
    const date = metadata?.fechaCorte;
    const data = object(body) ? body[section] : null;
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !object(data)) return NextResponse.json({ error: "La fecha y los datos de la sección son obligatorios." }, { status: 400, headers: cors(request.headers.get("origin")) });
    const table = tables[section];
    const [record] = await db.update(table).set({ snapshotDate: date, data, updatedAt: new Date() }).where(eq(table.id, id)).returning();
    return record ? NextResponse.json({ record }, { headers: cors(request.headers.get("origin")) }) : NextResponse.json({ error: "El registro no existe." }, { status: 404, headers: cors(request.headers.get("origin")) });
  } catch (error) {
    console.error(`No fue posible actualizar ${section}`, error);
    return NextResponse.json({ error: "No fue posible actualizar el registro. Verifica que la fecha no esté ocupada." }, { status: 500, headers: cors(request.headers.get("origin")) });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ section: string; id: string }> }) {
  const { section, id } = await params(context);
  if (!validSection(section) || !id) return NextResponse.json({ error: "La sección o el identificador no son válidos." }, { status: 400, headers: cors(request.headers.get("origin")) });
  const table = tables[section];
  const [deleted] = await db.delete(table).where(eq(table.id, id)).returning({ id: table.id });
  return deleted ? NextResponse.json({ deleted: true, id: deleted.id }, { headers: cors(request.headers.get("origin")) }) : NextResponse.json({ error: "El registro no existe." }, { status: 404, headers: cors(request.headers.get("origin")) });
}

export function OPTIONS(request: NextRequest) { return new NextResponse(null, { status: 204, headers: cors(request.headers.get("origin")) }); }
