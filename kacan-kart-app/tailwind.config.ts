import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gece: "#180B2E",
        gece2: "#2A1653",
        mercan: "#FF5D8F",
        mercankoyu: "#E8437A",
        limon: "#FFD166",
        krem: "#FFF6ED",
        mor: "#8B5CF6",
      },
      fontFamily: {
        baslik: ["var(--font-baloo)", "sans-serif"],
        govde: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        yumusak: "0 20px 60px -15px rgba(24, 11, 46, 0.45)",
      },
    },
  },
  plugins: [],
};
export default config;
