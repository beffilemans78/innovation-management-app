import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/authorization";
import { roleLabels, type Role } from "@/lib/roles";

export default async function ProfilePage() {
  const user = await requireUser();
  return <AppShell title="Mein Profil"><div className="grid gap-6 md:grid-cols-2">
    <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="font-semibold">Persönliche Angaben</h2><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-slate-500">Name</dt><dd>{user.profile?.displayName}</dd></div><div><dt className="text-slate-500">E-Mail</dt><dd>{user.email}</dd></div><div><dt className="text-slate-500">Rollen</dt><dd>{user.roles.map(({role}) => roleLabels[role.code as Role]).join(", ")}</dd></div></dl></section>
    <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="font-semibold">Sicherheit</h2><p className="mt-2 text-sm text-slate-600">Passwort, Passkeys, MFA und aktive Sitzungen verwalten Sie im zentralen Identitätsdienst.</p></section>
  </div></AppShell>;
}
