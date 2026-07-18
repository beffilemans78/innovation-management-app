import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/authorization";

const modules = ["Ideen einreichen", "Innovationskampagnen", "Bewertungen", "IP Management"];

export default async function Home() {
  const user = await requireUser();
  return <AppShell title="Guten Tag">
    <p className="mb-8 max-w-2xl text-slate-300">Willkommen{user.profile?.displayName ? `, ${user.profile.displayName}` : ""}. Weitere Module werden schrittweise ergänzt.</p>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {modules.map((module, index) => <section key={module} className="group rounded-2xl border border-white/10 bg-[#07162d]/70 p-5 text-slate-100 shadow-[0_18px_60px_rgba(0,0,0,0.2)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-sky-300/25 hover:bg-[#0a1c36]/80">
        <span className="text-xs font-medium uppercase tracking-wider text-sky-300">{index === 0 ? "Demnächst" : "Geplant"}</span>
        <h2 className="mt-3 font-semibold tracking-tight">{module}</h2>
        <div className="mt-8 h-px w-10 bg-gradient-to-r from-sky-300/70 to-transparent transition-all duration-300 group-hover:w-20" />
      </section>)}
    </div>
  </AppShell>;
}
