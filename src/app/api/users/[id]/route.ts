import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { requireAdmin } from "@/lib/adminAccess";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "Usuario inválido." }, { status: 400 });
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const roleId = Number(body.roleId);
    const password = typeof body.password === "string" ? body.password : "";
    if (!name || !email || !Number.isInteger(roleId) || roleId <= 0 || (password && password.length < 6)) return NextResponse.json({ error: "Nombre, correo y rol son obligatorios. La contraseña debe tener mínimo 6 caracteres." }, { status: 400 });
    const changes: { name: string; email: string; roleId: number; password?: string; updatedPassword?: boolean } = { name, email, roleId };
    if (password) { changes.password = await hashPassword(password); changes.updatedPassword = true; }
    const [updated] = await db.update(users).set(changes).where(eq(users.id, id)).returning({ id: users.id, name: users.name, email: users.email });
    if (!updated) return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("No fue posible actualizar el usuario", error);
    return NextResponse.json({ error: "No fue posible actualizar el usuario. Verifica que el correo no esté repetido." }, { status: 409 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const id = Number((await context.params).id);
  const currentUserId = Number(request.headers.get("x-dashboard-user-id"));
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "Usuario inválido." }, { status: 400 });
  if (id === currentUserId) return NextResponse.json({ error: "No puedes eliminar tu propio usuario." }, { status: 400 });
  const [deleted] = await db.delete(users).where(eq(users.id, id)).returning({ id: users.id });
  if (!deleted) return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
