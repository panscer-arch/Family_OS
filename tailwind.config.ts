import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10141f",
        panel: "#151b2b",
        panelSoft: "#1e293b",
        mint: "#8ee6c8",
        peach: "#f8b88b",
        skysoft: "#9fd8ff",
        berry: "#ff89b7"
      },
      boxShadow: {
        glow: "0 24px 70px rgba(95, 184, 255, 0.14)"
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        rise: "rise 340ms ease-out both"
      }
    }
  },
  plugins: []
} satisfies Config;
