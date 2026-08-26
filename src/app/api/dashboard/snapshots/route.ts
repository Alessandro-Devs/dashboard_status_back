import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { dashboardSnapshots } from "@/db/schema";

const allowedOrigin = process.env.FRONTEND_URL ?? "http://localhost:5173";

function cors(origin?: string | null) {
  return { "Access-Control-Allow-Origin": origin ?? allowedOrigin, "Access-Control-Allow-Methods": "GET, OPTIONS", Vary: "Origin" };
}

export async function GET(request: NextRequest) {
  try {
    const snapshots = await db.select({ id: dashboardSnapshots.id, date: dashboardSnapshots.snapshotDate, createdAt: dashboardSnapshots.createdAt, updatedAt: dashboardSnapshots.updatedAt, data: dashboardSnapshots.data }).from(dashboardSnapshots).orderBy(desc(dashboardSnapshots.snapshotDate));
    const records = snapshots.filter((snapshot) => snapshot.data !== null && typeof snapshot.data === "object" && Object.prototype.hasOwnProperty.call(snapshot.data, "evaluacion"));
    return NextResponse.json({ records }, { headers: cors(request.headers.get("origin")) });
  } catch (error) {
    console.error("No fue posible obtener los registros de evaluación", error);
    return NextResponse.json({ error: "No fue posible cargar los registros de evaluación." }, { status: 500, headers: cors(request.headers.get("origin")) });
  }
}

export function OPTIONS(request: NextRequest) { return new NextResponse(null, { status: 204, headers: cors(request.headers.get("origin")) }); }
