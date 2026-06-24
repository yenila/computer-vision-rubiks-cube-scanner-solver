import type { PropsWithChildren, ReactNode } from "react";

export function Panel({ title, actions, children }: PropsWithChildren<{ title: string; actions?: ReactNode }>) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-panel-shine bg-slate-900/70 shadow-glass backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
      <header className="flex min-h-14 items-center justify-between gap-3 border-b border-white/10 px-4 sm:px-5">
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">{title}</h2>
        {actions}
      </header>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}
