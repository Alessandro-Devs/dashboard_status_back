import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { evaluacionSnapshots } from "@/db/schema";

const allowedOrigin = process.env.FRONTEND_URL ?? "http://localhost:5173";
const cors = (origin?: string | null) => ({ "Access-Control-Allow-Origin": origin ?? allowedOrigin, "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", Vary: "Origin" });
const validDate = (value: unknown): value is string => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
const isObject = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object" && !Array.isArray(value);

export async function GET(request: NextRequest) {
  try {
    const records = await db.select({ id: evaluacionSnapshots.id, date: evaluacionSnapshots.snapshotDate, createdAt: evaluacionSnapshots.createdAt, updatedAt: evaluacionSnapshots.updatedAt, data: evaluacionSnapshots.data }).from(evaluacionSnapshots).orderBy(desc(evaluacionSnapshots.snapshotDate));
    return NextResponse.json({ records: records.map((record) => ({ ...record, data: { evaluacion: record.data } })) }, { headers: cors(request.headers.get("origin")) });
  } catch (error) {
    console.error("No fue posible obtener los registros de evaluación", error);
    return NextResponse.json({ error: "No fue posible cargar los registros de evaluación." }, { status: 500, headers: cors(request.headers.get("origin")) });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    if (!isObject(body)) return NextResponse.json({ error: "El cuerpo de la solicitud no es válido." }, { status: 400, headers: cors(request.headers.get("origin")) });
    const metadata = isObject(body.metadata) ? body.metadata : null;
    const snapshotDate = metadata?.fechaCorte ?? body.snapshotDate;
    const evaluation = body.evaluacion ?? (isObject(body.data) ? body.data.evaluacion : undefined);
    if (!validDate(snapshotDate)) return NextResponse.json({ error: "metadata.fechaCorte debe usar el formato YYYY-MM-DD." }, { status: 400, headers: cors(request.headers.get("origin")) });
    if (!isObject(evaluation)) return NextResponse.json({ error: "La sección evaluacion es obligatoria." }, { status: 400, headers: cors(request.headers.get("origin")) });
    const now = new Date();
    const [record] = await db.insert(evaluacionSnapshots).values({ snapshotDate, data: evaluation, updatedAt: now }).onConflictDoUpdate({ target: evaluacionSnapshots.snapshotDate, set: { data: evaluation, updatedAt: now } }).returning();
    return NextResponse.json({ record: { id: record.id, date: record.snapshotDate, createdAt: record.createdAt, updatedAt: record.updatedAt, data: { metadata: { fechaCorte: record.snapshotDate }, evaluacion: record.data } } }, { status: 201, headers: cors(request.headers.get("origin")) });
  } catch (error) {
    console.error("No fue posible guardar el registro de evaluación", error);
    return NextResponse.json({ error: "No fue posible guardar el registro de evaluación." }, { status: 500, headers: cors(request.headers.get("origin")) });
  }
}

export function OPTIONS(request: NextRequest) { return new NextResponse(null, { status: 204, headers: cors(request.headers.get("origin")) }); }
