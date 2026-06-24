import type { ApiSession } from "../lib/api";
export declare function WelcomeScreen({ onSession, onContinueAsGuest }: {
    onSession: (session: ApiSession) => void;
    onContinueAsGuest: () => void;
}): import("react").JSX.Element;
