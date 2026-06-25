import { jsx as _jsx } from "react/jsx-runtime";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
vi.mock("./lib/api", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        api: {
            ...actual.api,
            getSession: () => Promise.resolve(null),
            onAuthStateChange: () => () => undefined,
            leaderboard: () => new Promise(() => undefined)
        }
    };
});
describe("App entry flow", () => {
    beforeEach(() => localStorage.clear());
    it("starts at the login and guest gateway before entering guest mode", () => {
        render(_jsx(App, {}));
        expect(screen.getByRole("heading", { name: "Enter CubeVision" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Continue as guest" })).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Continue as guest" }));
        expect(screen.getByRole("button", { name: "Start 3D engine" })).toBeInTheDocument();
    });
});
