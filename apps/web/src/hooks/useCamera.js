import { useCallback, useEffect, useRef, useState } from "react";
export function useCamera() {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [permission, setPermission] = useState("idle");
    const [error, setError] = useState(null);
    const [facingMode, setFacingMode] = useState(null);
    const stop = useCallback(() => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setFacingMode(null);
        setPermission("idle");
    }, []);
    const start = useCallback(async () => {
        setPermission("requesting");
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false
            });
            streamRef.current = stream;
            setFacingMode(stream.getVideoTracks()[0]?.getSettings().facingMode ?? null);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setPermission("granted");
        }
        catch (cameraError) {
            setPermission("denied");
            setError(cameraError instanceof Error ? cameraError.message : "Camera access failed.");
        }
    }, []);
    useEffect(() => stop, [stop]);
    return { videoRef, permission, error, facingMode, start, stop };
}
