export type AppMode = "demo" | "fullstack" | "supabase";

const configuredMode = import.meta.env.VITE_APP_MODE?.toLowerCase();

export const appMode: AppMode =
  configuredMode === "fullstack" || configuredMode === "demo" || configuredMode === "supabase"
    ? configuredMode
    : import.meta.env.DEV
      ? "fullstack"
      : "supabase";

export const isDemoMode = appMode === "demo";
export const isSupabaseMode = appMode === "supabase";
export const usesBrowserSolver = isDemoMode || isSupabaseMode;
