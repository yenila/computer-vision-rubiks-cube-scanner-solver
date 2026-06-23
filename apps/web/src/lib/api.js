const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
async function request(path, options = {}, token) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10000);
    let response;
    try {
        response = await fetch(`${API_URL}${path}`, {
            ...options,
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...options.headers
            }
        });
    }
    catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            throw new Error("Request timed out. Check the scan and try again.");
        }
        throw error;
    }
    finally {
        window.clearTimeout(timeoutId);
    }
    const payload = (await response.json().catch(() => null));
    if (!response.ok) {
        const message = payload && typeof payload === "object" && "error" in payload ? payload.error : null;
        throw new Error(message || `Request failed with ${response.status}`);
    }
    return payload;
}
export const api = {
    register: (input) => request("/auth/register", { method: "POST", body: JSON.stringify(input) }),
    login: (input) => request("/auth/login", { method: "POST", body: JSON.stringify(input) }),
    solve: (facelets) => request("/solver", { method: "POST", body: JSON.stringify({ facelets }) }),
    listScans: (token) => request("/scans", {}, token),
    createScan: (token, input) => request("/scans", { method: "POST", body: JSON.stringify(input) }, token),
    listSolves: (token) => request("/solves", {}, token),
    createSolve: (token, input) => request("/solves", { method: "POST", body: JSON.stringify(input) }, token),
    leaderboard: () => request("/leaderboard")
};
