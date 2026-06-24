import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#f8fafc",
        panel: "#0b1220",
        line: "#233047",
        accent: "#22d3ee",
        canvas: "#05070d",
        violetglow: "#8b5cf6"
      },
      boxShadow: {
        glass: "0 24px 80px rgba(0, 0, 0, 0.35)",
        cyan: "0 0 36px rgba(34, 211, 238, 0.18)"
      },
      backgroundImage: {
        "panel-shine": "linear-gradient(135deg, rgba(255,255,255,.08), rgba(255,255,255,.015) 55%, rgba(34,211,238,.04))"
      }
    }
  },
  plugins: []
} satisfies Config;
