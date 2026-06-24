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
    return (
      <div className="space-y-3">
        <div>
          <div className="text-sm font-semibold text-ink">{session.user.name}</div>
          <div className="text-sm text-slate-600">{session.user.email}</div>
        </div>
        <Button icon={<LogOut size={16} />} onClick={() => onSession(null)}>
          Sign out
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
        <input aria-label="Name" autoComplete="name" className="h-10 w-full rounded-md border border-line px-3 text-sm" value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" />
      ) : null}
      <input aria-label="Email" autoComplete="email" className="h-10 w-full rounded-md border border-line px-3 text-sm" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
      <input
        aria-label="Password"
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        className="h-10 w-full rounded-md border border-line px-3 text-sm"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
      />
      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
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
