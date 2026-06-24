import { CUBE_COLOR_RGB, classifyColor } from "@rubiks/shared";
let openCvPromise = null;
let readyOpenCv = null;
export function isOpenCvReady(candidate) {
    if (!candidate || typeof candidate !== "object")
        return false;
    const value = candidate;
    return typeof value.Mat === "function" && typeof value.MatVector === "function" && typeof value.imread === "function";
}
async function resolveOpenCv(candidate, timeoutMs = 8000) {
    try {
        const resolved = candidate && typeof candidate.then === "function"
            ? await candidate
            : candidate;
        if (isOpenCvReady(resolved))
            return resolved;
        if (!resolved || typeof resolved !== "object")
            return null;
        return await new Promise((resolve) => {
            const runtime = resolved;
            const previousInitializer = runtime.onRuntimeInitialized;
            let settled = false;
            const finish = (value) => {
                if (settled)
                    return;
                settled = true;
                window.clearInterval(pollId);
                window.clearTimeout(timeoutId);
                resolve(value);
            };
            const check = () => {
                if (isOpenCvReady(runtime))
                    finish(runtime);
            };
            runtime.onRuntimeInitialized = () => {
                previousInitializer?.();
                check();
            };
            const pollId = window.setInterval(check, 50);
            const timeoutId = window.setTimeout(() => finish(null), timeoutMs);
            check();
        });
    }
    catch {
        return null;
    }
}
export function loadOpenCv() {
    if (readyOpenCv)
        return Promise.resolve(true);
    if (openCvPromise)
        return openCvPromise;
    openCvPromise = (async () => {
        if (!window.cv) {
            const loaded = await new Promise((resolve) => {
                const script = document.createElement("script");
                script.async = true;
                script.dataset.opencvLoader = "true";
                script.src = import.meta.env.VITE_OPENCV_URL ?? "https://docs.opencv.org/4.x/opencv.js";
                script.onload = () => resolve(true);
                script.onerror = () => resolve(false);
                document.head.appendChild(script);
            });
            if (!loaded)
                return false;
        }
        readyOpenCv = await resolveOpenCv(window.cv);
        return Boolean(readyOpenCv);
    })().then((ready) => {
        if (!ready)
            openCvPromise = null;
        return ready;
    });
    return openCvPromise;
}
export function robustAverageRgb(imageData) {
    const samples = [];
    for (let index = 0; index < imageData.length; index += 4) {
        const r = imageData[index] ?? 0;
        const g = imageData[index + 1] ?? 0;
        const b = imageData[index + 2] ?? 0;
        const alpha = imageData[index + 3] ?? 0;
        if (alpha < 128)
            continue;
        samples.push({ r, g, b, luminance: r * 0.2126 + g * 0.7152 + b * 0.0722 });
    }
    if (!samples.length)
        return { r: 0, g: 0, b: 0 };
    samples.sort((a, b) => a.luminance - b.luminance);
    const trim = samples.length >= 10 ? Math.floor(samples.length * 0.15) : 0;
    const selected = samples.slice(trim, samples.length - trim || samples.length);
    const total = selected.reduce((sum, sample) => ({ r: sum.r + sample.r, g: sum.g + sample.g, b: sum.b + sample.b }), { r: 0, g: 0, b: 0 });
    return {
        r: total.r / selected.length,
        g: total.g / selected.length,
        b: total.b / selected.length
    };
}
function sampleAverage(ctx, x, y, size) {
    const imageData = ctx.getImageData(Math.max(0, x), Math.max(0, y), size, size).data;
    return robustAverageRgb(imageData);
}
function gridCenters(width, height) {
    const side = Math.floor(Math.min(width, height) * 0.62);
    const left = Math.floor((width - side) / 2);
    const top = Math.floor((height - side) / 2);
    const cell = side / 3;
    return Array.from({ length: 9 }, (_, index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        return {
            x: left + col * cell + cell / 2,
            y: top + row * cell + cell / 2,
            size: Math.max(10, Math.floor(cell * 0.3))
        };
    });
}
function detectOpenCvCenters(canvas) {
    const cv = readyOpenCv;
    if (!cv)
        return [];
    const src = cv.imread(canvas);
    const rgb = new cv.Mat();
    const hsv = new cv.Mat();
    const mask = new cv.Mat();
    const channels = new cv.MatVector();
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    let saturation = null;
    try {
        cv.cvtColor(src, rgb, cv.COLOR_RGBA2RGB);
        cv.cvtColor(rgb, hsv, cv.COLOR_RGB2HSV);
        cv.split(hsv, channels);
        saturation = channels.get(1);
        cv.threshold(saturation, mask, 34, 255, cv.THRESH_BINARY);
        cv.findContours(mask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
        const minArea = (canvas.width * canvas.height) / 2500;
        const maxArea = (canvas.width * canvas.height) / 18;
        const candidates = [];
        for (let i = 0; i < contours.size(); i += 1) {
            const contour = contours.get(i);
            try {
                const area = cv.contourArea(contour);
                const rect = cv.boundingRect(contour);
                const ratio = rect.width / Math.max(1, rect.height);
                const withinCenter = Math.abs(rect.x + rect.width / 2 - canvas.width / 2) < canvas.width * 0.38 && Math.abs(rect.y + rect.height / 2 - canvas.height / 2) < canvas.height * 0.38;
                if (area > minArea && area < maxArea && ratio > 0.55 && ratio < 1.55 && withinCenter) {
                    candidates.push({
                        x: rect.x + rect.width / 2,
                        y: rect.y + rect.height / 2,
                        size: Math.max(10, Math.floor(Math.min(rect.width, rect.height) * 0.45)),
                        area
                    });
                }
            }
            finally {
                contour.delete();
            }
        }
        if (candidates.length < 9)
            return [];
        const centers = candidates
            .sort((a, b) => b.area - a.area)
            .slice(0, 9)
            .sort((a, b) => a.y - b.y)
            .reduce((rows, candidate, index, sorted) => {
            if (index % 3 === 0) {
                sorted.slice(index, index + 3).sort((a, b) => a.x - b.x).forEach((item) => rows.push(item));
            }
            return rows;
        }, []);
        const rows = [centers.slice(0, 3), centers.slice(3, 6), centers.slice(6, 9)];
        const rowSpreadValid = rows.every((row) => Math.max(...row.map((item) => item.y)) - Math.min(...row.map((item) => item.y)) < canvas.height * 0.1);
        const columns = [0, 1, 2].map((column) => rows.map((row) => row[column]));
        const columnSpreadValid = columns.every((column) => Math.max(...column.map((item) => item.x)) - Math.min(...column.map((item) => item.x)) < canvas.width * 0.1);
        const centerX = centers.reduce((sum, item) => sum + item.x, 0) / centers.length;
        const centerY = centers.reduce((sum, item) => sum + item.y, 0) / centers.length;
        const centered = Math.abs(centerX - canvas.width / 2) < canvas.width * 0.12 && Math.abs(centerY - canvas.height / 2) < canvas.height * 0.12;
        return rowSpreadValid && columnSpreadValid && centered ? centers : [];
    }
    finally {
        saturation?.delete();
        src.delete();
        rgb.delete();
        hsv.delete();
        mask.delete();
        channels.delete();
        contours.delete();
        hierarchy.delete();
    }
}
export function classifyStickerSamples(samples, palette = CUBE_COLOR_RGB, expectedCenter) {
    const detectedCenter = classifyColor(samples[4] ?? { r: 0, g: 0, b: 0 }, palette).color;
    const calibratedPalette = expectedCenter && samples[4]
        ? { ...palette, [expectedCenter]: samples[4] }
        : palette;
    return {
        detectedCenter,
        stickers: samples.map((rgb, index) => {
            const classified = classifyColor(rgb, calibratedPalette);
            return {
                color: index === 4 && expectedCenter ? expectedCenter : classified.color,
                confidence: index === 4 && expectedCenter ? Math.max(0.9, classified.confidence) : classified.confidence,
                source: "detected",
                rgb
            };
        })
    };
}
export async function detectFace(video, face, options = {}) {
    const canvas = document.createElement("canvas");
    const width = video.videoWidth || 960;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx)
        throw new Error("Canvas 2D context is unavailable.");
    ctx.drawImage(video, 0, 0, width, height);
    // Never make a capture wait for the remote OpenCV runtime. The aligned grid
    // is deterministic and immediately available; OpenCV is an optional upgrade
    // only after its background initialization has completed.
    const hasOpenCv = Boolean(readyOpenCv);
    let openCvCenters = [];
    let openCvFailed = false;
    if (hasOpenCv) {
        try {
            openCvCenters = detectOpenCvCenters(canvas);
        }
        catch {
            // OpenCV builds differ across CDN/runtime variants. Detection must always
            // degrade to the aligned grid instead of blocking the first capture.
            openCvFailed = true;
        }
    }
    const centers = openCvCenters.length === 9 ? openCvCenters : gridCenters(width, height);
    const samples = centers.map((center) => sampleAverage(ctx, Math.floor(center.x - center.size / 2), Math.floor(center.y - center.size / 2), center.size));
    const { stickers, detectedCenter } = classifyStickerSamples(samples, options.palette, options.expectedCenter);
    return {
        faceScan: {
            face,
            stickers,
            capturedAt: new Date().toISOString()
        },
        debug: {
            mode: openCvCenters.length === 9 ? "opencv" : "fallback-grid",
            message: openCvCenters.length === 9
                ? "OpenCV.js detected nine regular sticker candidates."
                : openCvFailed
                    ? "OpenCV was unavailable at capture time; used the aligned grid safely."
                    : "Using the aligned center grid for stable sampling.",
            detectedCenter
        }
    };
}
