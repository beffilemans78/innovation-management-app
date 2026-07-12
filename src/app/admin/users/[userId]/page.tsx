import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { updateUserAccess } from "@/app/admin/users/actions";
import { requirePermission } from "@/lib/authorization";
import { db } from "@/lib/db";
import { roleLabels, roles } from "@/lib/roles";

export default async function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  await requirePermission("users:manage");
  const { userId } = await params;
  const user = await db.user.findUnique({ where: { id: userId }, include: { profile: true, roles: { include: { role: true } } } });
  if (!user) notFound();
  const assigned = new Set(user.roles.map(({role}) => role.code));
  return <AppShell title={user.profile?.displayName ?? user.email}>
    <form action={updateUserAccess} className="max-w-2xl space-y-8 rounded-2xl border border-slate-200 bg-white p-6">
      <input type="hidden" name="userId" value={user.id} />
      <fieldset><legend className="font-semibold">Rollen</legend><div className="mt-4 grid gap-3 sm:grid-cols-2">{roles.map((role) => <label key={role} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"><input type="checkbox" name="roles" value={role} defaultChecked={assigned.has(role)} />{roleLabels[role]}</label>)}</div></fieldset>
      <label className="block"><span className="font-semibold">Status</span><select name="status" defaultValue={user.status} className="mt-3 block w-full rounded-xl border border-slate-300 px-3 py-2"><option value="ACTIVE">Aktiv</option><option value="SUSPENDED">Gesperrt</option><option value="DISABLED">Deaktiviert</option></select></label>
      <button className="rounded-xl bg-blue-700 px-5 py-3 font-medium text-white">Änderungen speichern</button>
    </form>
  </AppShell>;
}
