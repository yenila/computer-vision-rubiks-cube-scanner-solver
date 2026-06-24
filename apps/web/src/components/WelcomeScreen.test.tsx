import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WelcomeScreen } from "./WelcomeScreen";

describe("WelcomeScreen", () => {
  it("offers authentication and enters guest mode explicitly", () => {
    const continueAsGuest = vi.fn();

    render(<WelcomeScreen onSession={vi.fn()} onContinueAsGuest={continueAsGuest} />);

    expect(screen.getByRole("heading", { name: "Enter CubeVision" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Continue as guest" }));

    expect(continueAsGuest).toHaveBeenCalledOnce();
  });

  it("allows switching to account registration", () => {
    render(<WelcomeScreen onSession={vi.fn()} onContinueAsGuest={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(screen.getByRole("button", { name: "Create account" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Name" })).toBeInTheDocument();
  });
});
