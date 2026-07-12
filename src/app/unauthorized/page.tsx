import Link from "next/link";

export default function UnauthorizedPage() {
  return <main className="grid min-h-screen place-items-center bg-slate-50 px-6"><section className="max-w-md text-center"><p className="text-sm font-medium text-red-700">Zugriff verweigert</p><h1 className="mt-3 text-3xl font-semibold">Keine Berechtigung</h1><p className="mt-3 text-slate-600">Für diesen Bereich ist eine zusätzliche Rolle erforderlich.</p><Link href="/" className="mt-6 inline-block text-blue-700">Zur Startseite</Link></section></main>;
}
