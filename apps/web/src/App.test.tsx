import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

vi.mock("./lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./lib/api")>();
  return {
    ...actual,
    api: {
      ...actual.api,
      leaderboard: () => new Promise(() => undefined)
    }
  };
});

describe("App entry flow", () => {
  beforeEach(() => localStorage.clear());

  it("always starts at the login and guest gateway, even with a stored session", () => {
    localStorage.setItem("rubiks-session", JSON.stringify({
      token: "stored-token",
      user: { id: "user-1", name: "Stored User", email: "stored@example.com" }
    }));

    render(<App />);

    expect(screen.getByRole("heading", { name: "Enter CubeVision" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue as guest" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Continue as guest" }));
    expect(screen.getByRole("button", { name: "Start 3D engine" })).toBeInTheDocument();
  });
});
