import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { hasPermission, type Role } from "@/lib/roles";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true, roles: { include: { role: true } } },
  });
  if (!user || user.status !== "ACTIVE") redirect("/login");
  return user;
}

export async function requirePermission(permission: string) {
  const user = await requireUser();
  const userRoles = user.roles.map(({ role }) => role.code as Role);
  if (!hasPermission(userRoles, permission)) redirect("/unauthorized");
  return user;
}
