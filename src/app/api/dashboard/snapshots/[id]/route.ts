import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { evaluacionSnapshots } from "@/db/schema";

const allowedOrigin = process.env.FRONTEND_URL ?? "http://localhost:5173";
const cors = (origin?: string | null) => ({ "Access-Control-Allow-Origin": origin ?? allowedOrigin, "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", Vary: "Origin" });
const isObject = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object" && !Array.isArray(value);
const parseId = (value: string) => { const id = Number(value); return Number.isInteger(id) && id > 0 ? id : null; };

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const id = parseId((await context.params).id);
  if (!id) return NextResponse.json({ error: "El identificador no es válido." }, { status: 400, headers: cors(request.headers.get("origin")) });
  const [record] = await db.select().from(evaluacionSnapshots).where(eq(evaluacionSnapshots.id, id)).limit(1);
  if (!record) return NextResponse.json({ error: "El registro no existe." }, { status: 404, headers: cors(request.headers.get("origin")) });
  return NextResponse.json({ record: { id: record.id, date: record.snapshotDate, createdAt: record.createdAt, updatedAt: record.updatedAt, data: { metadata: { fechaCorte: record.snapshotDate }, evaluacion: record.data } } }, { headers: cors(request.headers.get("origin")) });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const id = parseId((await context.params).id);
  if (!id) return NextResponse.json({ error: "El identificador no es válido." }, { status: 400, headers: cors(request.headers.get("origin")) });
  try {
    const body: unknown = await request.json();
    if (!isObject(body) || !isObject(body.metadata) || typeof body.metadata.fechaCorte !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(body.metadata.fechaCorte) || !isObject(body.evaluacion)) return NextResponse.json({ error: "La fecha y la sección evaluacion son obligatorias." }, { status: 400, headers: cors(request.headers.get("origin")) });
    const [record] = await db.update(evaluacionSnapshots).set({ snapshotDate: body.metadata.fechaCorte, data: body.evaluacion, updatedAt: new Date() }).where(eq(evaluacionSnapshots.id, id)).returning();
    if (!record) return NextResponse.json({ error: "El registro no existe." }, { status: 404, headers: cors(request.headers.get("origin")) });
    return NextResponse.json({ record }, { headers: cors(request.headers.get("origin")) });
  } catch (error) {
    console.error("No fue posible actualizar Evaluación", error);
    return NextResponse.json({ error: "No fue posible actualizar el registro. Verifica que la fecha no esté ocupada." }, { status: 500, headers: cors(request.headers.get("origin")) });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const id = parseId((await context.params).id);
  if (!id) return NextResponse.json({ error: "El identificador no es válido." }, { status: 400, headers: cors(request.headers.get("origin")) });
  const [deleted] = await db.delete(evaluacionSnapshots).where(eq(evaluacionSnapshots.id, id)).returning({ id: evaluacionSnapshots.id });
  if (!deleted) return NextResponse.json({ error: "El registro no existe." }, { status: 404, headers: cors(request.headers.get("origin")) });
  return NextResponse.json({ deleted: true, id: deleted.id }, { headers: cors(request.headers.get("origin")) });
}

export function OPTIONS(request: NextRequest) { return new NextResponse(null, { status: 204, headers: cors(request.headers.get("origin")) }); }
