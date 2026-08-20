import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "dashboard-status-api",
    timestamp: new Date().toISOString(),
  });
}
