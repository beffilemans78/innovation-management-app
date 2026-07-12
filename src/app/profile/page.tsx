import { AppShell } from "@/components/app-shell";

export default function ProfilePage() {
  return <AppShell title="Mein Profil"><div className="grid gap-6 md:grid-cols-2">
    <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="font-semibold">Persönliche Angaben</h2><p className="mt-2 text-sm text-slate-600">Anzeigename, Abteilung und Sprache werden hier verwaltet.</p></section>
    <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="font-semibold">Sicherheit</h2><p className="mt-2 text-sm text-slate-600">Passwort, Passkeys, MFA und aktive Sitzungen verwalten Sie im zentralen Identitätsdienst.</p></section>
  </div></AppShell>;
}
