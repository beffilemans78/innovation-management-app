import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { requirePermission } from "@/lib/authorization";
import { db } from "@/lib/db";
import { roleLabels, type Role } from "@/lib/roles";

export default async function UsersPage() {
  await requirePermission("users:read");
  const users = await db.user.findMany({ include: { profile: true, roles: { include: { role: true } } }, orderBy: { email: "asc" } });
  return <AppShell title="Benutzerverwaltung">
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-slate-200 px-5 py-3 text-xs font-medium uppercase tracking-wider text-slate-500"><span>Benutzer</span><span>Status</span><span>Aktion</span></div>
      {users.map((user) => <div key={user.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0"><div><p className="font-medium">{user.profile?.displayName ?? user.email}</p><p className="text-sm text-slate-500">{user.email} · {user.roles.map(({role}) => roleLabels[role.code as Role]).join(", ")}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{user.status}</span><Link className="text-sm font-medium text-blue-700" href={`/admin/users/${user.id}`}>Verwalten</Link></div>)}
      {users.length === 0 && <div className="p-8 text-center text-sm text-slate-500">Noch keine Benutzer vorhanden.</div>}
    </div>
  </AppShell>;
}
