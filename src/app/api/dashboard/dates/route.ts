import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aprendizajeSnapshots, evaluacionSnapshots, gestionCalidadSnapshots, gestionEscolarSnapshots, tutoriaFormacionSnapshots } from "@/db/schema";

const allowedOrigin = process.env.FRONTEND_URL ?? "http://localhost:5173";
const corsHeaders = (origin?: string | null) => ({ "Access-Control-Allow-Origin": origin ?? allowedOrigin, "Access-Control-Allow-Methods": "GET, OPTIONS", "Cache-Control": "public, s-maxage=60, stale-while-revalidate=86400", Vary: "Origin" });
const tables = [gestionCalidadSnapshots, gestionEscolarSnapshots, aprendizajeSnapshots, evaluacionSnapshots, tutoriaFormacionSnapshots] as const;

// Devuelve las fechas de corte que tienen datos en al menos una sección.
export async function GET(request: NextRequest) {
  try {
    const rows = await Promise.all(tables.map((table) => db.selectDistinct({ date: table.snapshotDate }).from(table)));
    const dates = [...new Set(rows.flat().map((row) => String(row.date)))].sort();
    return NextResponse.json({ dates }, { headers: corsHeaders(request.headers.get("origin")) });
  } catch (error) {
    console.error("No fue posible obtener las fechas con datos", error);
    return NextResponse.json({ error: "No fue posible consultar las fechas disponibles." }, { status: 500, headers: corsHeaders(request.headers.get("origin")) });
  }
}

export function OPTIONS(request: NextRequest) { return new NextResponse(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) }); }
