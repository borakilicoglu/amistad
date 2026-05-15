import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { amistadDirectory } from "./search-profile.js"
import { configSchema, type AmistadConfig } from "../../schemas/config.js"

export const configPath = join(amistadDirectory, "config.json")

export function getDefaultConfig(): AmistadConfig {
  return configSchema.parse({})
}

export function readConfig(): AmistadConfig {
  if (!existsSync(configPath)) {
    return getDefaultConfig()
  }

  return configSchema.parse(JSON.parse(readFileSync(configPath, "utf8")))
}

export function saveConfig(config: AmistadConfig) {
  const parsedConfig = configSchema.parse(config)

  mkdirSync(amistadDirectory, { recursive: true })
  writeFileSync(configPath, `${JSON.stringify(parsedConfig, null, 2)}\n`, "utf8")
}
