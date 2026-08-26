import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aprendizajeSnapshots, evaluacionSnapshots, gestionCalidadSnapshots, gestionEscolarSnapshots, tutoriaFormacionSnapshots } from "@/db/schema";

const allowedOrigin = process.env.FRONTEND_URL ?? "http://localhost:5173";
const cors = (origin?: string | null) => ({ "Access-Control-Allow-Origin": origin ?? allowedOrigin, "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", Vary: "Origin" });
const sectionTables = {
  gestionCalidad: gestionCalidadSnapshots,
  gestionEscolar: gestionEscolarSnapshots,
  aprendizaje: aprendizajeSnapshots,
  evaluacion: evaluacionSnapshots,
  tutoriaFormacion: tutoriaFormacionSnapshots,
} as const;
type SectionName = keyof typeof sectionTables;
const isObject = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object" && !Array.isArray(value);
const isSection = (value: string): value is SectionName => value in sectionTables;

export async function GET(request: NextRequest, context: { params: Promise<{ section: string }> }) {
  const { section } = await context.params;
  if (!isSection(section)) return NextResponse.json({ error: "La sección solicitada no existe." }, { status: 404, headers: cors(request.headers.get("origin")) });
  const table = sectionTables[section];
  try {
    const records = await db.select({ id: table.id, date: table.snapshotDate, createdAt: table.createdAt, updatedAt: table.updatedAt, data: table.data }).from(table).orderBy(desc(table.snapshotDate));
    return NextResponse.json({ records }, { headers: cors(request.headers.get("origin")) });
  } catch (error) {
    console.error(`No fue posible consultar ${section}`, error);
    return NextResponse.json({ error: "No fue posible consultar los registros." }, { status: 500, headers: cors(request.headers.get("origin")) });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ section: string }> }) {
  const { section } = await context.params;
  if (!isSection(section)) return NextResponse.json({ error: "La sección solicitada no existe." }, { status: 404, headers: cors(request.headers.get("origin")) });
  try {
    const body: unknown = await request.json();
    if (!isObject(body)) return NextResponse.json({ error: "El cuerpo de la solicitud no es válido." }, { status: 400, headers: cors(request.headers.get("origin")) });
    const metadata = isObject(body.metadata) ? body.metadata : null;
    const date = metadata?.fechaCorte;
    const sectionData = body[section];
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "metadata.fechaCorte debe usar el formato YYYY-MM-DD." }, { status: 400, headers: cors(request.headers.get("origin")) });
    if (!isObject(sectionData)) return NextResponse.json({ error: `La sección ${section} es obligatoria.` }, { status: 400, headers: cors(request.headers.get("origin")) });
    const table = sectionTables[section];
    const now = new Date();
    const [record] = await db.insert(table).values({ snapshotDate: date, data: sectionData, updatedAt: now }).onConflictDoUpdate({ target: table.snapshotDate, set: { data: sectionData, updatedAt: now } }).returning();
    return NextResponse.json({ record }, { status: 201, headers: cors(request.headers.get("origin")) });
  } catch (error) {
    console.error(`No fue posible guardar ${section}`, error);
    return NextResponse.json({ error: "No fue posible guardar el registro." }, { status: 500, headers: cors(request.headers.get("origin")) });
  }
}

export function OPTIONS(request: NextRequest) { return new NextResponse(null, { status: 204, headers: cors(request.headers.get("origin")) }); }
