import type { Config } from "tailwindcss";
import { heroui } from "@heroui/theme";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  plugins: [heroui()],
} satisfies Config;
