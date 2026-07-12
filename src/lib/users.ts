import type { RoleCode } from "@prisma/client";
import { db } from "@/lib/db";
import { roleLabels } from "@/lib/roles";

export async function ensureRoles() {
  await Promise.all(
    Object.entries(roleLabels).map(([code, displayName]) =>
      db.role.upsert({
        where: { code: code as RoleCode },
        update: { displayName },
        create: { code: code as RoleCode, displayName },
      }),
    ),
  );
}

export async function provisionUser(input: {
  identityProviderId: string;
  email: string;
  displayName: string;
}) {
  await ensureRoles();
  const employeeRole = await db.role.findUniqueOrThrow({ where: { code: "EMPLOYEE" } });

  const user = await db.user.upsert({
    where: { identityProviderId: input.identityProviderId },
    update: { email: input.email, profile: { upsert: { create: { displayName: input.displayName }, update: { displayName: input.displayName } } } },
    create: {
      identityProviderId: input.identityProviderId,
      email: input.email,
      profile: { create: { displayName: input.displayName } },
      roles: { create: { roleId: employeeRole.id } },
      auditEvents: { create: { action: "USER_PROVISIONED", targetType: "USER" } },
    },
  });

  const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  if (bootstrapEmail && input.email.toLowerCase() === bootstrapEmail) {
    const adminRole = await db.role.findUniqueOrThrow({ where: { code: "ADMINISTRATOR" } });
    await db.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: adminRole.id } },
      update: {},
      create: { userId: user.id, roleId: adminRole.id },
    });
  }

  return user;
}
