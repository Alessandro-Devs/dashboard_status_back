import { NextRequest, NextResponse } from "next/server";

export function requireAdmin(request: NextRequest) {
  const role = (request.headers.get("x-dashboard-role") ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (role !== "admin") return NextResponse.json({ error: "Solo un administrador puede realizar esta acción." }, { status: 403 });
  return null;
}
