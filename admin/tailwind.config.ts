import type { Config } from "tailwindcss"
import baseConfig from "../shared/config/tailwind.config"

const config: Config = {
  ...baseConfig,
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
}

export default config
