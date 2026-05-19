import type { Command } from "commander"
import { existsSync } from "node:fs"
import pc from "picocolors"
import { getProjectEnv } from "../core/config/env.js"
import {
  defaultBraveExecutablePath,
  defaultBraveUserDataDir,
} from "../core/mcp/playwright-command.js"
import { printHeader, statusLine } from "../core/output/terminal.js"
import { configPath, readConfig } from "../core/storage/config.js"
import { jobsPath, readSearchProfile, searchProfilePath } from "../core/storage/search-profile.js"

export type DoctorCheck = {
  label: string
  ok: boolean
  detail: string
}

export function registerDoctorCommand(program: Command) {
  program
    .command("doctor")
    .description("Check the local Amistad environment")
    .action(() => {
      printHeader()

      console.log(pc.bold(pc.green("Amistad doctor")))
      console.log("")
      const checks = collectDoctorChecks()
      for (const check of checks) {
        statusLine(check.label, check.ok, check.detail)
      }
      console.log("")

      if (checks.every((check) => check.ok)) {
        console.log(pc.green("Environment looks ready."))
        return
      }

      console.log(pc.yellow("Environment has warnings."))
    })
}

export function collectDoctorChecks(): DoctorCheck[] {
  const nodeMajor = Number.parseInt(process.versions.node.split(".")[0] ?? "0", 10)
  const configuredCommand = getProjectEnv("PLAYWRIGHT_MCP_COMMAND")?.trim()
  const executablePath = getProjectEnv("PLAYWRIGHT_MCP_EXECUTABLE_PATH") ?? defaultBraveExecutablePath
  const userDataDir = getProjectEnv("PLAYWRIGHT_MCP_USER_DATA_DIR") ?? defaultBraveUserDataDir
  const extensionToken = getProjectEnv("PLAYWRIGHT_MCP_EXTENSION_TOKEN")

  return [
    {
      label: "Node.js",
      ok: nodeMajor >= 18,
      detail: process.version,
    },
    {
      label: "Platform",
      ok: true,
      detail: `${process.platform} ${process.arch}`,
    },
    {
      label: "Package",
      ok: existsSync("package.json"),
      detail: "package.json",
    },
    {
      label: "TypeScript config",
      ok: existsSync("tsconfig.json"),
      detail: "tsconfig.json",
    },
    {
      label: "Source entry",
      ok: existsSync("src/cli.ts"),
      detail: "src/cli.ts",
    },
    {
      label: "Build output",
      ok: existsSync("dist/cli.js"),
      detail: existsSync("dist/cli.js") ? "dist/cli.js" : "missing dist/cli.js; run `pnpm build`",
    },
    {
      label: "Env file",
      ok: existsSync(".env"),
      detail: existsSync(".env") ? ".env" : "missing .env; copy .env.example",
    },
    {
      label: "MCP command",
      ok: Boolean(configuredCommand) || existsSync("node_modules/.bin/playwright-mcp"),
      detail: configuredCommand || "node_modules/.bin/playwright-mcp",
    },
    {
      label: "Extension token",
      ok: Boolean(extensionToken),
      detail: extensionToken ? "configured" : "missing PLAYWRIGHT_MCP_EXTENSION_TOKEN",
    },
    {
      label: "Brave executable",
      ok: existsSync(executablePath),
      detail: executablePath,
    },
    {
      label: "Brave user data",
      ok: existsSync(userDataDir),
      detail: userDataDir,
    },
    {
      label: "Config",
      ...validateStoredFile(configPath, readConfig, "optional; defaults will be used"),
    },
    {
      label: "Search profile",
      ...validateStoredFile(searchProfilePath, readSearchProfile, "missing; run `amistad profile`"),
    },
    {
      label: "Saved jobs",
      ok: existsSync(jobsPath),
      detail: existsSync(jobsPath) ? jobsPath : "optional; no saved jobs yet",
    },
  ]
}

function validateStoredFile(path: string, read: () => unknown, missingDetail: string) {
  if (!existsSync(path)) {
    return {
      ok: path === configPath,
      detail: missingDetail,
    }
  }

  try {
    read()
    return {
      ok: true,
      detail: `${path} valid`,
    }
  } catch {
    return {
      ok: false,
      detail: `${path} invalid`,
    }
  }
}
