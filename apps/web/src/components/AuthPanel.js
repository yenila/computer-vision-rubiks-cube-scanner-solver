import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LogIn, LogOut, UserPlus } from "lucide-react";
import { useState } from "react";
import { api } from "../lib/api";
import { Button } from "./Button";
export function AuthPanel({ session, onSession }) {
    const [mode, setMode] = useState("login");
    const [email, setEmail] = useState("demo@rubiks.local");
    const [name, setName] = useState("Demo Solver");
    const [password, setPassword] = useState("password123");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const submit = async () => {
        setLoading(true);
        setError(null);
        try {
            const next = mode === "login" ? await api.login({ email, password }) : await api.register({ email, password, name });
            onSession(next);
        }
        catch (authError) {
            setError(authError instanceof Error ? authError.message : "Authentication failed.");
        }
        finally {
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
            }
            catch (authError) {
                setError(authError instanceof Error ? authError.message : "Sign out failed.");
            }
            finally {
                setLoading(false);
            }
        };
        return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-violet-500 text-sm font-black text-slate-950", children: session.user.name.slice(0, 2).toUpperCase() }), _jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "truncate text-sm font-semibold text-white", children: session.user.name }), _jsx("div", { className: "truncate text-xs text-slate-400", children: session.user.email })] })] }), error ? _jsx("div", { className: "rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200", children: error }) : null, _jsx(Button, { icon: _jsx(LogOut, { size: 16 }), onClick: () => void signOut(), disabled: loading, children: loading ? "Signing out" : "Sign out" })] }));
    }
    return (_jsxs("form", { className: "space-y-3", onSubmit: (event) => {
            event.preventDefault();
            void submit();
        }, children: [mode === "register" ? (_jsx("input", { "aria-label": "Name", autoComplete: "name", className: "h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10", value: name, onChange: (event) => setName(event.target.value), placeholder: "Name" })) : null, _jsx("input", { "aria-label": "Email", autoComplete: "email", className: "h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10", type: "email", value: email, onChange: (event) => setEmail(event.target.value), placeholder: "Email" }), _jsx("input", { "aria-label": "Password", autoComplete: mode === "login" ? "current-password" : "new-password", className: "h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10", type: "password", value: password, onChange: (event) => setPassword(event.target.value), placeholder: "Password" }), error ? _jsx("div", { className: "rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200", children: error }) : null, _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { className: "flex-1", icon: mode === "login" ? _jsx(LogIn, { size: 16 }) : _jsx(UserPlus, { size: 16 }), variant: "primary", type: "submit", disabled: loading, children: loading ? "Working" : mode === "login" ? "Sign in" : "Create account" }), _jsx(Button, { variant: "ghost", onClick: () => setMode(mode === "login" ? "register" : "login"), children: mode === "login" ? "Register" : "Use login" })] })] }));
}
