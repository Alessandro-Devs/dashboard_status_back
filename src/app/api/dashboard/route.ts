import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { dashboardSnapshots } from "@/db/schema";

const allowedOrigin = process.env.FRONTEND_URL ?? "http://localhost:5173";

function corsHeaders(origin?: string | null) {
  return {
    "Access-Control-Allow-Origin": origin ?? allowedOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    Vary: "Origin",
  };
}

export async function GET(request: NextRequest) {
  const requestedDate = request.nextUrl.searchParams.get("date");

  if (requestedDate && !/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
    return NextResponse.json(
      { error: "El parámetro date debe usar el formato YYYY-MM-DD." },
      { status: 400, headers: corsHeaders(request.headers.get("origin")) },
    );
  }

  try {
    const [snapshot] = requestedDate
      ? await db
        .select()
        .from(dashboardSnapshots)
        .where(eq(dashboardSnapshots.snapshotDate, requestedDate))
        .limit(1)
      : await db
        .select()
        .from(dashboardSnapshots)
        .orderBy(desc(dashboardSnapshots.snapshotDate))
        .limit(1);

    if (!snapshot) {
      return NextResponse.json(
        { error: "No existen datos para la fecha solicitada." },
        { status: 404, headers: corsHeaders(request.headers.get("origin")) },
      );
    }

    return NextResponse.json(
      {
        snapshot: {
          id: snapshot.id,
          date: snapshot.snapshotDate,
          createdAt: snapshot.createdAt,
          updatedAt: snapshot.updatedAt,
        },
        data: snapshot.data,
      },
      { headers: corsHeaders(request.headers.get("origin")) },
    );
  } catch (error) {
    console.error("No fue posible obtener la instantánea del dashboard", error);
    return NextResponse.json(
      { error: "No fue posible consultar los datos del dashboard." },
      { status: 500, headers: corsHeaders(request.headers.get("origin")) },
    );
  }
}

export function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) });
}
