export type AppMode = "demo" | "fullstack";

const configuredMode = import.meta.env.VITE_APP_MODE?.toLowerCase();

export const appMode: AppMode =
  configuredMode === "fullstack" || configuredMode === "demo"
    ? configuredMode
    : import.meta.env.DEV
      ? "fullstack"
      : "demo";

export const isDemoMode = appMode === "demo";
