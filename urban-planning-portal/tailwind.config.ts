import type { Config } from "tailwindcss"
import baseConfig from "../shared/config/tailwind.config"

const config: Config = {
  ...baseConfig,
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
}

export default config
