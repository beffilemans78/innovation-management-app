import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/authorization";

const modules = ["Ideen einreichen", "Innovationskampagnen", "Bewertungen", "IP Management"];

export default async function Home() {
  const user = await requireUser();
  return <AppShell title="Guten Tag">
    <p className="mb-8 max-w-2xl text-slate-600">Willkommen{user.profile?.displayName ? `, ${user.profile.displayName}` : ""}. Weitere Module werden schrittweise ergänzt.</p>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {modules.map((module, index) => <section key={module} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <span className="text-xs font-medium uppercase tracking-wider text-blue-700">{index === 0 ? "Demnächst" : "Geplant"}</span>
        <h2 className="mt-3 font-semibold">{module}</h2>
      </section>)}
    </div>
  </AppShell>;
}
