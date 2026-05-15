import type { Command } from "commander"
import { encode } from "@toon-format/toon"
import pc from "picocolors"
import { printHeader } from "../core/output/terminal.js"
import { configPath, readConfig, saveConfig } from "../core/storage/config.js"
import type { AmistadConfig } from "../schemas/config.js"

type ConfigKey = "format" | "location" | "role"

const keyMap = {
  format: "defaultFormat",
  location: "defaultLocation",
  role: "defaultRole",
} satisfies Record<ConfigKey, keyof AmistadConfig>

export function registerConfigCommand(program: Command) {
  const config = program.command("config").description("Manage Amistad defaults")

  config
    .command("get")
    .description("Print current config")
    .option("--format <format>", "Output format: pretty, json, or toon", "pretty")
    .action((options: { format?: string }) => {
      const format = resolveFormat(options.format)

      if (!format) {
        console.log(pc.red(`Unsupported output format: ${options.format}`))
        console.log(pc.dim("Use `pretty`, `json`, or `toon`."))
        process.exitCode = 1
        return
      }

      const currentConfig = readConfig()

      if (format === "json") {
        console.log(JSON.stringify(currentConfig, null, 2))
        return
      }

      if (format === "toon") {
        console.log(encode({ config: currentConfig }))
        return
      }

      printHeader()
      console.log(pc.bold(pc.cyan("Amistad config")))
      console.log("")
      console.log(`${pc.dim("format:")} ${currentConfig.defaultFormat}`)
      console.log(`${pc.dim("location:")} ${currentConfig.defaultLocation}`)
      console.log(`${pc.dim("role:")} ${currentConfig.defaultRole}`)
      console.log(`${pc.dim("path:")} ${configPath}`)
    })

  config
    .command("set")
    .description("Set a config value")
    .argument("<key>", "Config key: format, location, or role")
    .argument("<value>", "Config value")
    .action((key: string, value: string) => {
      if (!isConfigKey(key)) {
        console.log(pc.red(`Unsupported config key: ${key}`))
        console.log(pc.dim("Use `format`, `location`, or `role`."))
        process.exitCode = 1
        return
      }

      if (key === "format" && !isFormat(value)) {
        console.log(pc.red(`Unsupported format: ${value}`))
        console.log(pc.dim("Use `pretty`, `json`, or `toon`."))
        process.exitCode = 1
        return
      }

      const currentConfig = readConfig()
      const nextConfig = {
        ...currentConfig,
        [keyMap[key]]: value,
      }

      saveConfig(nextConfig)
      console.log(pc.green(`Set ${key} to ${value}`))
    })
}

function isConfigKey(key: string): key is ConfigKey {
  return key === "format" || key === "location" || key === "role"
}

function isFormat(value: string) {
  return value === "pretty" || value === "json" || value === "toon"
}

function resolveFormat(format: string | undefined) {
  if (!format) return "pretty"

  if (isFormat(format)) {
    return format
  }

  return null
}
