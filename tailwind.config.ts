// Tailwind v4 uses CSS-first configuration via @theme blocks in globals.css.
// This file exists for tooling compatibility. Most config lives in src/app/globals.css.
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;
