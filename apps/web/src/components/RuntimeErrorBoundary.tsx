import { Component, type ErrorInfo, type ReactNode } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "./Button";

type BoundaryState = { failed: boolean };

abstract class RuntimeBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  override state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("A contained UI runtime failed.", error, info);
  }
}

export class SpatialEngineBoundary extends RuntimeBoundary {
  override render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="flex h-[430px] min-h-[360px] flex-col items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-400/[0.06] p-6 text-center">
        <TriangleAlert className="text-amber-300" size={28} />
        <div className="mt-4 text-sm font-bold text-white">Spatial engine could not start</div>
        <p className="mt-2 max-w-sm text-xs leading-5 text-slate-400">Scanning and solving are still available. Reload once to fetch the latest 3D engine bundle.</p>
        <Button className="mt-4" icon={<RefreshCw size={15} />} onClick={() => window.location.reload()}>Reload 3D engine</Button>
      </div>
    );
  }
}

export class AppErrorBoundary extends RuntimeBoundary {
  override render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center bg-canvas p-6 text-center text-white">
        <div className="w-full max-w-md rounded-3xl border border-red-300/20 bg-slate-900/90 p-8 shadow-glass">
          <TriangleAlert className="mx-auto text-red-300" size={32} />
          <h1 className="mt-5 text-xl font-black">CubeVision recovered from a UI error</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">Your API and saved data were not changed. Return to the login screen with a clean interface state.</p>
          <Button
            className="mt-6 w-full"
            icon={<RefreshCw size={16} />}
            variant="primary"
            onClick={() => {
              localStorage.removeItem("rubiks-session");
              window.location.reload();
            }}
          >
            Return to login
          </Button>
        </div>
      </main>
    );
  }
}
