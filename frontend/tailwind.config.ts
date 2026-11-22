import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        uifry: {
          bg: "#080a0f",
          surface: "#0c0f17",
          sidebar: "#0c0f17",
          card: "#121722",
          cardInner: "#171e2c",
          border: "#1c2333",
          borderLight: "#263045",
          blue: "#2563eb",
          blueHover: "#1d4ed8",
          blueGlow: "rgba(37, 99, 235, 0.35)",
          pill: "#161d2a",
          pillActive: "#2563eb",
          pink: "#f43f5e",
          pinkCard: "#2d121c",
          lime: "#84cc16",
          limeCard: "#142813",
          amber: "#f59e0b",
          amberCard: "#2a1b0b",
          cyan: "#06b6d4",
          purple: "#a855f7",
        },
        web3: {
          bg: "#080a0f",
          surface: "#0c0f17",
          card: "#121722",
          cardHover: "#182030",
          cardActive: "#1e283d",
          border: "#1c2333",
          borderMuted: "#141a26",
          borderHighlight: "#2b3852",
          primary: "#2563eb",
          primaryHover: "#1d4ed8",
          accent: "#3b82f6",
          amber: "#f59e0b",
          emerald: "#10b981",
          rose: "#f43f5e",
          slate: "#64748b",
        },
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
      boxShadow: {
        "uifry-blue": "0 10px 25px -5px rgba(37, 99, 235, 0.4)",
        "uifry-card": "0 12px 32px -8px rgba(0, 0, 0, 0.6)",
      },
    },
  },
  plugins: [],
};

export default config;
