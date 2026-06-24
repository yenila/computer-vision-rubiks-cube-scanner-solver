import { Camera, CheckCircle2, History, Play, ScanLine, Sparkles } from "lucide-react";
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
    <main className="relative min-h-screen overflow-hidden bg-canvas px-4 py-6 text-white sm:px-6 lg:py-8">
      <div className="pointer-events-none absolute -left-40 top-0 h-[32rem] w-[32rem] rounded-full bg-cyan-400/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[36rem] w-[36rem] rounded-full bg-violet-500/10 blur-[130px]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1380px] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-[0_40px_120px_rgba(0,0,0,.55)] backdrop-blur-2xl lg:grid-cols-[1.2fr_.8fr]">
        <section className="relative flex min-h-[34rem] flex-col justify-between overflow-hidden border-b border-white/10 p-7 sm:p-10 lg:border-b-0 lg:border-r lg:p-14">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,rgba(34,211,238,.12),transparent_28%),linear-gradient(135deg,rgba(255,255,255,.03),transparent_45%)]" />
          <div className="relative">
            <div className="mb-12 flex items-center gap-3">
              <div className="grid h-11 w-11 grid-cols-2 gap-0.5 rounded-xl border border-white/15 bg-gradient-to-br from-slate-200 to-slate-600 p-2 shadow-[0_0_32px_rgba(34,211,238,.18)]">
                <span className="rounded-sm bg-cyan-300" /><span className="rounded-sm bg-violet-400" />
                <span className="rounded-sm bg-emerald-400" /><span className="rounded-sm bg-slate-950" />
              </div>
              <div>
                <div className="text-sm font-black tracking-[0.22em] text-white">CUBEVISION</div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-300">Neural cube intelligence</div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-3 py-1.5 text-xs font-semibold text-cyan-200">
              <Sparkles size={14} /> Computer vision meets spatial solving
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.03] tracking-[-0.04em] sm:text-6xl xl:text-7xl">
              See the state.
              <span className="block bg-gradient-to-r from-cyan-300 via-slate-100 to-violet-400 bg-clip-text text-transparent">Solve the system.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              A precision computer-vision workspace that captures your cube, validates every sticker, and turns complexity into a guided solution.
            </p>
          </div>

          <div className="relative mt-12 grid gap-3 sm:grid-cols-3">
            {[
              [Camera, "Vision capture", "OpenCV assisted"],
              [ScanLine, "Verified solve", "State validated"],
              [History, "Progress data", "History & ranking"]
            ].map(([Icon, title, detail]) => {
              const FeatureIcon = Icon as typeof Camera;
              return (
                <div key={String(title)} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
                  <FeatureIcon className="mb-3 text-cyan-300" size={19} />
                  <div className="text-sm font-semibold text-white">{String(title)}</div>
                  <div className="mt-1 text-xs text-slate-500">{String(detail)}</div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="relative flex items-center p-6 sm:p-10 lg:p-12">
          <div className="w-full rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-glass backdrop-blur-xl sm:p-8">
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">Secure workspace</div>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-white">Enter CubeVision</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">Save your sessions or launch a private guest solve.</p>
              </div>
              <div className="hidden h-10 w-10 items-center justify-center rounded-full border border-emerald-300/20 bg-emerald-400/10 text-emerald-300 sm:flex">
                <CheckCircle2 size={19} />
              </div>
            </div>

            <AuthPanel session={null} onSession={(session) => session && onSession(session)} />

            <div className="my-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
              <div className="h-px flex-1 bg-white/10" />
              or launch instantly
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <Button className="w-full" icon={<Play size={16} />} onClick={onContinueAsGuest}>
              Continue as guest
            </Button>
            <p className="mt-4 text-center text-xs leading-5 text-slate-500">Guest sessions keep solving local and do not save history.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
