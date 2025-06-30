import type { Config } from "tailwindcss"
import baseConfig from "../shared/config/tailwind.config"

const config: Config = {
  ...baseConfig,
  prefix: "",
}

export default config
