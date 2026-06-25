import { LogIn, LogOut, UserPlus } from "lucide-react";
import { useState } from "react";
import type { ApiSession } from "../lib/api";
import { api } from "../lib/api";
import { Button } from "./Button";

export function AuthPanel({ session, onSession }: { session: ApiSession | null; onSession: (session: ApiSession | null) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("demo@rubiks.local");
  const [name, setName] = useState("Demo Solver");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const next = mode === "login" ? await api.login({ email, password }) : await api.register({ email, password, name });
      onSession(next);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  if (session) {
    const signOut = async () => {
      setLoading(true);
      setError(null);
      try {
        await api.logout();
        onSession(null);
      } catch (authError) {
        setError(authError instanceof Error ? authError.message : "Sign out failed.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-violet-500 text-sm font-black text-slate-950">
            {session.user.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">{session.user.name}</div>
            <div className="truncate text-xs text-slate-400">{session.user.email}</div>
          </div>
        </div>
        {error ? <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div> : null}
        <Button icon={<LogOut size={16} />} onClick={() => void signOut()} disabled={loading}>
          {loading ? "Signing out" : "Sign out"}
        </Button>
      </div>
    );
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      {mode === "register" ? (
        <input aria-label="Name" autoComplete="name" className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10" value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" />
      ) : null}
      <input aria-label="Email" autoComplete="email" className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
      <input
        aria-label="Password"
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
      />
      {error ? <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div> : null}
      <div className="flex gap-2">
        <Button className="flex-1" icon={mode === "login" ? <LogIn size={16} /> : <UserPlus size={16} />} variant="primary" type="submit" disabled={loading}>
          {loading ? "Working" : mode === "login" ? "Sign in" : "Create account"}
        </Button>
        <Button variant="ghost" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "Register" : "Use login"}
        </Button>
      </div>
    </form>
  );
}
