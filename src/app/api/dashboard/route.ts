import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aprendizajeSnapshots, evaluacionSnapshots, gestionCalidadSnapshots, gestionEscolarSnapshots, tutoriaFormacionSnapshots } from "@/db/schema";

const allowedOrigin = process.env.FRONTEND_URL ?? "http://localhost:5173";
const corsHeaders = (origin?: string | null) => ({ "Access-Control-Allow-Origin": origin ?? allowedOrigin, "Access-Control-Allow-Methods": "GET, OPTIONS", "Cache-Control": "public, s-maxage=60, stale-while-revalidate=86400", Vary: "Origin" });
const tables = [gestionCalidadSnapshots, gestionEscolarSnapshots, aprendizajeSnapshots, evaluacionSnapshots, tutoriaFormacionSnapshots] as const;
const sectionNames = ["gestionCalidad", "gestionEscolar", "aprendizaje", "evaluacion", "tutoriaFormacion"] as const;

async function latestDate() {
  const latestRows = await Promise.all(tables.map((table) => db.select({ date: table.snapshotDate }).from(table).orderBy(desc(table.snapshotDate)).limit(1)));
  return latestRows.flatMap((rows) => rows[0]?.date ? [rows[0].date] : []).sort().at(-1) ?? null;
}

export async function GET(request: NextRequest) {
  const requestedDate = request.nextUrl.searchParams.get("date");
  if (requestedDate && !/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) return NextResponse.json({ error: "El parámetro date debe usar el formato YYYY-MM-DD." }, { status: 400, headers: corsHeaders(request.headers.get("origin")) });
  try {
    const resolvedDate = requestedDate ?? await latestDate();
    if (!resolvedDate) return NextResponse.json({ snapshot: null, data: null, message: "No existen datos para la fecha solicitada." }, { headers: corsHeaders(request.headers.get("origin")) });
    const rows = await Promise.all(tables.map((table) => db.select({ data: table.data, createdAt: table.createdAt, updatedAt: table.updatedAt }).from(table).where(eq(table.snapshotDate, resolvedDate)).limit(1)));
    const available = rows.flatMap((result) => result[0] ? [result[0]] : []);
    if (available.length === 0) return NextResponse.json({ snapshot: null, data: null, message: "No existen datos para la fecha solicitada." }, { headers: corsHeaders(request.headers.get("origin")) });
    const data: Record<string, unknown> = { metadata: { fechaCorte: resolvedDate } };
    rows.forEach((result, index) => { if (result[0]) data[sectionNames[index]] = result[0].data; });
    const createdAt = available.map((row) => row.createdAt).sort((a, b) => a.getTime() - b.getTime())[0];
    const updatedAt = available.map((row) => row.updatedAt).sort((a, b) => b.getTime() - a.getTime())[0];
    return NextResponse.json({ snapshot: { date: resolvedDate, createdAt, updatedAt }, data }, { headers: corsHeaders(request.headers.get("origin")) });
  } catch (error) {
    console.error("No fue posible obtener los datos del dashboard", error);
    return NextResponse.json({ error: "No fue posible consultar los datos del dashboard." }, { status: 500, headers: corsHeaders(request.headers.get("origin")) });
  }
}

export function OPTIONS(request: NextRequest) { return new NextResponse(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) }); }
