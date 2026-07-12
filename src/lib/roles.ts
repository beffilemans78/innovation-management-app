export const roles = [
  "EMPLOYEE",
  "MANAGER",
  "INNOVATION_AGENT",
  "ADMINISTRATOR",
  "IP_MANAGER",
] as const;

export type Role = (typeof roles)[number];

export const roleLabels: Record<Role, string> = {
  EMPLOYEE: "Mitarbeiter",
  MANAGER: "Führungskraft",
  INNOVATION_AGENT: "Innovation Agent",
  ADMINISTRATOR: "Administrator",
  IP_MANAGER: "IP Manager",
};

export const permissions = {
  EMPLOYEE: ["profile:read", "profile:update", "dashboard:read"],
  MANAGER: ["profile:read", "profile:update", "dashboard:read"],
  INNOVATION_AGENT: ["profile:read", "profile:update", "dashboard:read"],
  ADMINISTRATOR: [
    "profile:read",
    "profile:update",
    "dashboard:read",
    "users:read",
    "users:manage",
    "roles:assign",
  ],
  IP_MANAGER: ["profile:read", "profile:update", "dashboard:read"],
} as const satisfies Record<Role, readonly string[]>;

export function hasPermission(userRoles: Role[], permission: string) {
  return userRoles.some((role) =>
    (permissions[role] as readonly string[]).includes(permission),
  );
}
