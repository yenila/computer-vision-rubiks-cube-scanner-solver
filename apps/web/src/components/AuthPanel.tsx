import { Database, LogIn, LogOut, RotateCcw, UserPlus } from "lucide-react";
import { useState } from "react";
import type { ApiSession } from "../lib/api";
import { api } from "../lib/api";
import { isDemoMode } from "../lib/appMode";
import { Button } from "./Button";

export function AuthPanel({
  session,
  onSession,
  onDataReset
}: {
  session: ApiSession | null;
  onSession: (session: ApiSession | null) => void;
  onDataReset?: () => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
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

  if (isDemoMode && session) {
    return (
      <div className="space-y-3">
        <div className="rounded-md border border-teal-200 bg-teal-50 p-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-teal-900">
            <Database size={16} />
            Browser-local profile
          </div>
          <p className="mt-1 text-sm text-teal-800">Scans and solves stay on this device. No account or server is required.</p>
        </div>
        <div>
          <div className="text-sm font-semibold text-ink">{session.user.name}</div>
          <div className="text-sm text-slate-600">{session.user.email}</div>
        </div>
        <Button
          icon={<RotateCcw size={16} />}
          onClick={async () => {
            await api.resetDemoData();
            onDataReset?.();
          }}
        >
          Reset demo data
        </Button>
      </div>
    );
  }

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
    <div className="space-y-3">
      {mode === "register" ? (
        <input className="h-10 w-full rounded-md border border-line px-3 text-sm" value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" />
      ) : null}
      <input className="h-10 w-full rounded-md border border-line px-3 text-sm" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
      <input
        className="h-10 w-full rounded-md border border-line px-3 text-sm"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
      />
      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
      <div className="flex gap-2">
        <Button icon={mode === "login" ? <LogIn size={16} /> : <UserPlus size={16} />} variant="primary" onClick={submit} disabled={loading}>
          {loading ? "Working" : mode === "login" ? "Sign in" : "Create account"}
        </Button>
        <Button variant="ghost" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "Register" : "Use login"}
        </Button>
      </div>
    </div>
  );
}
