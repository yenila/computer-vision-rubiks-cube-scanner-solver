import { jsx as _jsx } from "react/jsx-runtime";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthPanel } from "./AuthPanel";
describe("AuthPanel", () => {
    it("emits a null session when signing out", () => {
        const onSession = vi.fn();
        render(_jsx(AuthPanel, { session: { token: "token", user: { id: "user-1", name: "Solver", email: "solver@example.com" } }, onSession: onSession }));
        fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
        expect(onSession).toHaveBeenCalledWith(null);
    });
});
