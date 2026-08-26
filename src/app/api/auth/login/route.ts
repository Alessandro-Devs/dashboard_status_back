import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { roles, users } from "@/db/schema";
import { comparePassword } from "@/lib/password";

const allowedOrigin = process.env.FRONTEND_URL ?? "http://localhost:5173";
const cors = (origin?: string | null) => ({ "Access-Control-Allow-Origin": origin ?? allowedOrigin, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", Vary: "Origin" });

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) return NextResponse.json({ error: "Correo y contraseña son obligatorios." }, { status: 400, headers: cors(origin) });
    const [user] = await db.select({ id: users.id, name: users.name, email: users.email, password: users.password, updatedPassword: users.updatedPassword, role: roles.name }).from(users).innerJoin(roles, eq(users.roleId, roles.id)).where(eq(users.email, email)).limit(1);
    if (!user || !(await comparePassword(password, user.password))) return NextResponse.json({ error: "Correo o contraseña incorrectos." }, { status: 401, headers: cors(origin) });
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, updatedPassword: user.updatedPassword } }, { headers: cors(origin) });
  } catch (error) {
    console.error("No fue posible iniciar sesión", error);
    return NextResponse.json({ error: "No fue posible iniciar sesión." }, { status: 500, headers: cors(origin) });
  }
}

export function OPTIONS(request: NextRequest) { return new NextResponse(null, { status: 204, headers: cors(request.headers.get("origin")) }); }
