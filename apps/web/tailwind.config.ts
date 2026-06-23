import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#151719",
        panel: "#f8fafc",
        line: "#d8dee5",
        accent: "#0f766e"
      }
    }
  },
  plugins: []
} satisfies Config;
