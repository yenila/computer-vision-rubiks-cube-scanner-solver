export declare function useCamera(): {
    videoRef: import("react").RefObject<HTMLVideoElement | null>;
    permission: "idle" | "requesting" | "granted" | "denied";
    error: string | null;
    facingMode: string | null;
    start: () => Promise<void>;
    stop: () => void;
};
