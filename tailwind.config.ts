import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx,js,jsx,mdx}",
    "./components/**/*.{ts,tsx,js,jsx,mdx}",
    "./pages/**/*.{ts,tsx,js,jsx,mdx}",
    "./src/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#0ea5e9", dark: "#0369a1" },
      },
      borderRadius: { "2xl": "1rem" },
      boxShadow: {
        soft:
          "0 1px 2px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;