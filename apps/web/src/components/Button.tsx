import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const styles = {
  primary: "border border-cyan-300/30 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_24px_rgba(34,211,238,.16)] hover:from-cyan-300 hover:to-blue-400 disabled:border-slate-700 disabled:bg-none disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none",
  secondary: "border border-white/10 bg-white/[0.06] text-slate-100 hover:border-cyan-300/30 hover:bg-cyan-300/10 disabled:text-slate-600",
  ghost: "border border-transparent text-slate-300 hover:border-white/10 hover:bg-white/[0.06] hover:text-white disabled:text-slate-600",
  danger: "border border-red-400/20 bg-red-500/15 text-red-200 hover:bg-red-500/25 disabled:bg-slate-800 disabled:text-slate-600"
};

export function Button({ icon, variant = "secondary", children, className = "", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-300/70 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
