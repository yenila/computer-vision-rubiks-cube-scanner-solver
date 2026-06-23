import type { ButtonHTMLAttributes, ReactNode } from "react";
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    icon?: ReactNode;
    variant?: "primary" | "secondary" | "ghost" | "danger";
};
export declare function Button({ icon, variant, children, className, type, ...props }: ButtonProps): import("react").JSX.Element;
export {};
