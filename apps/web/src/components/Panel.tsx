import type { PropsWithChildren, ReactNode } from "react";

export function Panel({ title, actions, children }: PropsWithChildren<{ title: string; actions?: ReactNode }>) {
  return (
    <section className="rounded-lg border border-line bg-white">
      <header className="flex min-h-12 items-center justify-between border-b border-line px-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">{title}</h2>
        {actions}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}
