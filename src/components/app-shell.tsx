import Link from "next/link";
import type { ReactNode } from "react";
import { DnaBackground } from "@/components/dna-background";

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#03161d] text-slate-950">
      <DnaBackground className="-z-20" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="border-b border-white/10 bg-[#041a22]/58 text-slate-100 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight">
              <span className="grid size-8 place-items-center rounded-lg border border-sky-300/25 bg-sky-400/10 text-xs text-sky-200 shadow-[0_0_24px_rgba(56,189,248,0.12)]">IH</span>
              Innovation Hub
            </Link>
            <nav className="flex gap-5 text-sm text-slate-300">
              <Link className="transition-colors hover:text-sky-200" href="/">Start</Link><Link className="transition-colors hover:text-sky-200" href="/profile">Profil</Link><Link className="transition-colors hover:text-sky-200" href="/admin/users">Benutzer</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
          <h1 className="mb-8 text-3xl font-semibold tracking-tight text-slate-50">{title}</h1>{children}
        </main>
        <footer className="mx-auto w-full max-w-6xl px-6 pb-6 text-xs text-slate-500">
          Innovation Hub · Secure IP Workspace
        </footer>
      </div>
    </div>
  );
}
