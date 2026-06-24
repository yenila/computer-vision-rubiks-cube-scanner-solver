import { Component, type ErrorInfo, type ReactNode } from "react";
type BoundaryState = {
    failed: boolean;
};
declare abstract class RuntimeBoundary extends Component<{
    children: ReactNode;
}, BoundaryState> {
    state: BoundaryState;
    static getDerivedStateFromError(): BoundaryState;
    componentDidCatch(error: Error, info: ErrorInfo): void;
}
export declare class SpatialEngineBoundary extends RuntimeBoundary {
    render(): string | number | bigint | boolean | Iterable<ReactNode> | Promise<string | number | bigint | boolean | import("react").ReactPortal | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | import("react").JSX.Element | null | undefined;
}
export declare class AppErrorBoundary extends RuntimeBoundary {
    render(): string | number | bigint | boolean | Iterable<ReactNode> | Promise<string | number | bigint | boolean | import("react").ReactPortal | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | import("react").JSX.Element | null | undefined;
}
export {};
