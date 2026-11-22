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
        web3: {
          bg: "#080b11",
          surface: "#0b0f17",
          card: "#0e131f",
          cardHover: "#131a29",
          cardActive: "#172033",
          border: "#1a2336",
          borderMuted: "#141c2c",
          borderHighlight: "#2c3b59",
          primary: "#4f46e5",
          primaryHover: "#4338ca",
          accent: "#6366f1",
          amber: "#f59e0b",
          emerald: "#10b981",
          rose: "#f43f5e",
          slate: "#64748b",
        },
      },
    },
  },
  plugins: [],
};

export default config;
