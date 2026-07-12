import { AppShell } from "@/components/app-shell";
import { roleLabels } from "@/lib/roles";

export default function UsersPage() {
  return <AppShell title="Benutzerverwaltung">
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-5"><input aria-label="Benutzer suchen" placeholder="Benutzer suchen …" className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
      <div className="p-8 text-center text-sm text-slate-500">Benutzer werden nach der Verbindung mit PostgreSQL hier angezeigt.</div>
    </div>
    <aside className="mt-6 rounded-2xl bg-blue-50 p-5 text-sm text-blue-950"><strong>Verfügbare Rollen:</strong> {Object.values(roleLabels).join(", ")}</aside>
  </AppShell>;
}
