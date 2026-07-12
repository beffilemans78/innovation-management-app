import { signIn } from "@/auth";

export default function LoginPage() {
  return <main className="grid min-h-screen place-items-center bg-slate-950 px-6">
    <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
      <p className="text-sm font-medium text-blue-700">Innovation Hub</p>
      <h1 className="mt-3 text-3xl font-semibold">Sicher anmelden</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">Melden Sie sich über das zentrale Unternehmenskonto an. Bei der ersten Anmeldung wird automatisch die Rolle Mitarbeiter vergeben.</p>
      <form action={async () => { "use server"; await signIn("keycloak", { redirectTo: "/" }); }}>
        <button className="mt-8 w-full rounded-xl bg-blue-700 px-4 py-3 font-medium text-white hover:bg-blue-800">Mit SSO fortfahren</button>
      </form>
      <p className="mt-6 text-xs text-slate-500">Die lokale Registrierung wird sicher durch den Identity Provider bereitgestellt.</p>
    </section>
  </main>;
}
