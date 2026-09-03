import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { roles, users } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { requireAdmin } from "@/lib/adminAccess";

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const [userRows, roleRows] = await Promise.all([
    db.select({ id: users.id, name: users.name, email: users.email, updatedPassword: users.updatedPassword, roleId: users.roleId, role: roles.name, createdAt: users.createdAt }).from(users).innerJoin(roles, eq(users.roleId, roles.id)).orderBy(users.name),
    db.select({ id: roles.id, name: roles.name }).from(roles).orderBy(roles.name),
  ]);
  return NextResponse.json({ users: userRows, roles: roleRows });
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const roleId = Number(body.roleId);
    if (!name || !email || password.length < 6 || !Number.isInteger(roleId) || roleId <= 0) return NextResponse.json({ error: "Nombre, correo, contraseña (mínimo 6 caracteres) y rol son obligatorios." }, { status: 400 });
    const [created] = await db.insert(users).values({ name, email, password: await hashPassword(password), roleId, updatedPassword: true }).returning({ id: users.id, name: users.name, email: users.email });
    return NextResponse.json({ user: created }, { status: 201 });
  } catch (error) {
    console.error("No fue posible crear el usuario", error);
    return NextResponse.json({ error: "No fue posible crear el usuario. Verifica que el correo no esté repetido." }, { status: 409 });
  }
}
