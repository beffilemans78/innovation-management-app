import { signIn } from "@/auth";
import { DnaBackground } from "@/components/dna-background";

export default function LoginPage() {
  return <main className="relative isolate grid min-h-screen overflow-hidden place-items-center bg-white px-6">
    <DnaBackground className="-z-20" />
    <section className="w-full max-w-md rounded-3xl border border-cyan-900/12 bg-white/96 p-8 shadow-[0_30px_100px_rgba(15,67,79,0.16)]">
      <p className="text-sm font-medium text-cyan-700">Innovation Hub</p>
      <h1 className="mt-3 text-3xl font-semibold">Sicher anmelden</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">Melden Sie sich über das zentrale Unternehmenskonto an. Bei der ersten Anmeldung wird automatisch die Rolle Mitarbeiter vergeben.</p>
      <form action={async () => { "use server"; await signIn("keycloak", { redirectTo: "/" }); }}>
        <button className="mt-8 w-full rounded-xl bg-cyan-700 px-4 py-3 font-medium text-white hover:bg-cyan-800">Mit SSO fortfahren</button>
      </form>
      <p className="mt-6 text-xs text-slate-500">Die lokale Registrierung wird sicher durch den Identity Provider bereitgestellt.</p>
    </section>
  </main>;
}
