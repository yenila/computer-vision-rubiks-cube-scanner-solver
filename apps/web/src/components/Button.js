import { jsxs as _jsxs } from "react/jsx-runtime";
const styles = {
    primary: "bg-accent text-white hover:bg-teal-800 disabled:bg-slate-300",
    secondary: "border border-line bg-white text-ink hover:bg-slate-100 disabled:text-slate-400",
    ghost: "text-slate-700 hover:bg-slate-200 disabled:text-slate-400",
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300"
};
export function Button({ icon, variant = "secondary", children, className = "", type = "button", ...props }) {
    return (_jsxs("button", { type: type, className: `inline-flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2 disabled:cursor-not-allowed ${styles[variant]} ${className}`, ...props, children: [icon, children] }));
}
