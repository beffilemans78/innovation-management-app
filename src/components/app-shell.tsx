import Link from "next/link";
import type { ReactNode } from "react";

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold">Innovation Hub</Link>
          <nav className="flex gap-5 text-sm text-slate-600">
            <Link href="/">Start</Link><Link href="/profile">Profil</Link><Link href="/admin/users">Benutzer</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-semibold tracking-tight">{title}</h1>{children}
      </main>
    </div>
  );
}
