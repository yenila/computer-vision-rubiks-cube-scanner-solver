import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "./Button";
class RuntimeBoundary extends Component {
    state = { failed: false };
    static getDerivedStateFromError() {
        return { failed: true };
    }
    componentDidCatch(error, info) {
        console.error("A contained UI runtime failed.", error, info);
    }
}
export class SpatialEngineBoundary extends RuntimeBoundary {
    render() {
        if (!this.state.failed)
            return this.props.children;
        return (_jsxs("div", { className: "flex h-[430px] min-h-[360px] flex-col items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-400/[0.06] p-6 text-center", children: [_jsx(TriangleAlert, { className: "text-amber-300", size: 28 }), _jsx("div", { className: "mt-4 text-sm font-bold text-white", children: "Spatial engine could not start" }), _jsx("p", { className: "mt-2 max-w-sm text-xs leading-5 text-slate-400", children: "Scanning and solving are still available. Reload once to fetch the latest 3D engine bundle." }), _jsx(Button, { className: "mt-4", icon: _jsx(RefreshCw, { size: 15 }), onClick: () => window.location.reload(), children: "Reload 3D engine" })] }));
    }
}
export class AppErrorBoundary extends RuntimeBoundary {
    render() {
        if (!this.state.failed)
            return this.props.children;
        return (_jsx("main", { className: "flex min-h-screen items-center justify-center bg-canvas p-6 text-center text-white", children: _jsxs("div", { className: "w-full max-w-md rounded-3xl border border-red-300/20 bg-slate-900/90 p-8 shadow-glass", children: [_jsx(TriangleAlert, { className: "mx-auto text-red-300", size: 32 }), _jsx("h1", { className: "mt-5 text-xl font-black", children: "CubeVision recovered from a UI error" }), _jsx("p", { className: "mt-3 text-sm leading-6 text-slate-400", children: "Your API and saved data were not changed. Return to the login screen with a clean interface state." }), _jsx(Button, { className: "mt-6 w-full", icon: _jsx(RefreshCw, { size: 16 }), variant: "primary", onClick: () => {
                            localStorage.removeItem("rubiks-session");
                            window.location.reload();
                        }, children: "Return to login" })] }) }));
    }
}
