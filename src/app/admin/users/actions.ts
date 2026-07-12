"use server";

import type { RoleCode, UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/authorization";
import { db } from "@/lib/db";
import { roles } from "@/lib/roles";
import { ensureRoles } from "@/lib/users";

const inputSchema = z.object({
  userId: z.string().uuid(),
  roles: z.array(z.enum(roles)).min(1),
  status: z.enum(["ACTIVE", "SUSPENDED", "DISABLED"]),
});

export async function updateUserAccess(formData: FormData) {
  const actor = await requirePermission("users:manage");
  const parsed = inputSchema.parse({ userId: formData.get("userId"), roles: formData.getAll("roles"), status: formData.get("status") });
  await ensureRoles();

  const target = await db.user.findUniqueOrThrow({ where: { id: parsed.userId }, include: { roles: { include: { role: true } } } });
  const removesAdmin = target.roles.some(({role}) => role.code === "ADMINISTRATOR") && !parsed.roles.includes("ADMINISTRATOR");
  const disablesAdmin = target.roles.some(({role}) => role.code === "ADMINISTRATOR") && parsed.status !== "ACTIVE";
  if (removesAdmin || disablesAdmin) {
    const activeAdmins = await db.user.count({ where: { status: "ACTIVE", roles: { some: { role: { code: "ADMINISTRATOR" } } } } });
    if (activeAdmins <= 1) throw new Error("Der letzte aktive Administrator darf nicht entfernt oder deaktiviert werden.");
  }

  const selectedRoles = await db.role.findMany({ where: { code: { in: parsed.roles as RoleCode[] } } });
  await db.$transaction([
    db.userRole.deleteMany({ where: { userId: target.id } }),
    db.userRole.createMany({ data: selectedRoles.map((role) => ({ userId: target.id, roleId: role.id, assignedBy: actor.id })) }),
    db.user.update({ where: { id: target.id }, data: { status: parsed.status as UserStatus } }),
    db.auditEvent.create({ data: { actorId: actor.id, action: "USER_ACCESS_UPDATED", targetType: "USER", targetId: target.id, metadata: { roles: parsed.roles, status: parsed.status } } }),
  ]);
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${target.id}`);
}
