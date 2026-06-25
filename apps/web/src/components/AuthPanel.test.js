import { jsx as _jsx } from "react/jsx-runtime";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthPanel } from "./AuthPanel";
import { api } from "../lib/api";
vi.mock("../lib/api", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        api: {
            ...actual.api,
            logout: vi.fn(() => Promise.resolve())
        }
    };
});
describe("AuthPanel", () => {
    it("signs out through Supabase and emits a null session", async () => {
        const onSession = vi.fn();
        render(_jsx(AuthPanel, { session: { token: "token", user: { id: "user-1", name: "Solver", email: "solver@example.com" } }, onSession: onSession }));
        fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
        await waitFor(() => expect(api.logout).toHaveBeenCalledOnce());
        expect(onSession).toHaveBeenCalledWith(null);
    });
});
