import { Camera, History, Play, ScanLine } from "lucide-react";
import type { ApiSession } from "../lib/api";
import { AuthPanel } from "./AuthPanel";
import { Button } from "./Button";

export function WelcomeScreen({
  onSession,
  onContinueAsGuest
}: {
  onSession: (session: ApiSession) => void;
  onContinueAsGuest: () => void;
}) {
  return (
    <main className="min-h-screen bg-[#eef2f6] px-4 py-8 sm:py-14">
      <div className="mx-auto grid min-h-[calc(100vh-7rem)] max-w-6xl overflow-hidden rounded-2xl border border-line bg-white shadow-xl shadow-slate-300/40 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="flex flex-col justify-between bg-slate-950 p-8 text-white sm:p-12">
          <div>
            <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-semibold text-teal-200">
              <ScanLine size={17} />
              Cube scanner and solver
            </div>
            <h1 className="max-w-xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              Scan your cube. Get a verified solution.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              Use your camera to capture each face, correct any stickers, and follow the solution move by move.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <Camera className="mb-3 text-teal-300" size={22} />
              <div className="font-semibold">Guided scanning</div>
              <div className="mt-1 text-sm leading-6 text-slate-400">Camera-assisted color detection with manual correction.</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <History className="mb-3 text-teal-300" size={22} />
              <div className="font-semibold">Save your progress</div>
              <div className="mt-1 text-sm leading-6 text-slate-400">Sign in to keep scans, solve history, and personal stats.</div>
            </div>
          </div>
        </section>

        <section className="flex items-center p-6 sm:p-10 lg:p-12">
          <div className="w-full">
            <div className="mb-7">
              <div className="text-sm font-bold uppercase tracking-widest text-teal-700">Welcome</div>
              <h2 className="mt-2 text-3xl font-black text-ink">Start solving</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Sign in to save your results, create an account, or continue without one.</p>
            </div>

            <AuthPanel session={null} onSession={(session) => session && onSession(session)} />

            <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
              <div className="h-px flex-1 bg-line" />
              or
              <div className="h-px flex-1 bg-line" />
            </div>

            <Button className="w-full" icon={<Play size={16} />} onClick={onContinueAsGuest}>
              Continue as guest
            </Button>
            <p className="mt-3 text-center text-xs leading-5 text-slate-500">Guest solving works normally, but scans and history cannot be saved.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
