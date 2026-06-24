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
        return (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-semibold text-ink", children: session.user.name }), _jsx("div", { className: "text-sm text-slate-600", children: session.user.email })] }), _jsx(Button, { icon: _jsx(LogOut, { size: 16 }), onClick: () => onSession(null), children: "Sign out" })] }));
    }
    return (_jsxs("form", { className: "space-y-3", onSubmit: (event) => {
            event.preventDefault();
            void submit();
        }, children: [mode === "register" ? (_jsx("input", { "aria-label": "Name", autoComplete: "name", className: "h-10 w-full rounded-md border border-line px-3 text-sm", value: name, onChange: (event) => setName(event.target.value), placeholder: "Name" })) : null, _jsx("input", { "aria-label": "Email", autoComplete: "email", className: "h-10 w-full rounded-md border border-line px-3 text-sm", type: "email", value: email, onChange: (event) => setEmail(event.target.value), placeholder: "Email" }), _jsx("input", { "aria-label": "Password", autoComplete: mode === "login" ? "current-password" : "new-password", className: "h-10 w-full rounded-md border border-line px-3 text-sm", type: "password", value: password, onChange: (event) => setPassword(event.target.value), placeholder: "Password" }), error ? _jsx("div", { className: "rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700", children: error }) : null, _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { className: "flex-1", icon: mode === "login" ? _jsx(LogIn, { size: 16 }) : _jsx(UserPlus, { size: 16 }), variant: "primary", type: "submit", disabled: loading, children: loading ? "Working" : mode === "login" ? "Sign in" : "Create account" }), _jsx(Button, { variant: "ghost", onClick: () => setMode(mode === "login" ? "register" : "login"), children: mode === "login" ? "Register" : "Use login" })] })] }));
}
