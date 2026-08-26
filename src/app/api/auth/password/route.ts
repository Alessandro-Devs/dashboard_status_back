import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/password";

const allowedOrigin = process.env.FRONTEND_URL ?? "http://localhost:5173";
const cors = (origin?: string | null) => ({ "Access-Control-Allow-Origin": origin ?? allowedOrigin, "Access-Control-Allow-Methods": "PATCH, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", Vary: "Origin" });

export async function PATCH(request: NextRequest) {
  const origin = request.headers.get("origin");
  try {
    const body = await request.json();
    const userId = Number(body.userId);
    const password = typeof body.password === "string" ? body.password : "";
    if (!Number.isInteger(userId) || userId <= 0 || !password) return NextResponse.json({ error: "La nueva contraseña es obligatoria." }, { status: 400, headers: cors(origin) });
    const [user] = await db.update(users).set({ password: await hashPassword(password), updatedPassword: false }).where(eq(users.id, userId)).returning({ id: users.id });
    if (!user) return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404, headers: cors(origin) });
    return NextResponse.json({ ok: true }, { headers: cors(origin) });
  } catch (error) {
    console.error("No fue posible actualizar la contraseña", error);
    return NextResponse.json({ error: "No fue posible actualizar la contraseña." }, { status: 500, headers: cors(origin) });
  }
}

export function OPTIONS(request: NextRequest) { return new NextResponse(null, { status: 204, headers: cors(request.headers.get("origin")) }); }
