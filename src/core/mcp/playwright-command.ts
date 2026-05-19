import { homedir } from "node:os"
import { getProjectEnv } from "../config/env.js"
import { amistadDirectory } from "../storage/search-profile.js"

export const defaultBraveExecutablePath = "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
export const defaultBraveUserDataDir = `${homedir()}/Library/Application Support/BraveSoftware/Brave-Browser`

export type BrowserLaunchOptions = {
  extensionToken?: string
  headless?: boolean
  managedBrowser?: boolean
}

export function buildPlaywrightMcpEnv(options: BrowserLaunchOptions) {
  const extensionToken =
    options.extensionToken ?? getProjectEnv("PLAYWRIGHT_MCP_EXTENSION_TOKEN")

  if (!extensionToken) {
    return undefined
  }

  return {
    PLAYWRIGHT_MCP_EXTENSION_TOKEN: extensionToken,
  }
}

export function buildPlaywrightMcpCommand(options: BrowserLaunchOptions) {
  const configuredCommand = getProjectEnv("PLAYWRIGHT_MCP_COMMAND")?.trim()
  if (configuredCommand) {
    return configuredCommand
  }

  const parts = ["./node_modules/.bin/playwright-mcp"]
  const executablePath = getProjectEnv("PLAYWRIGHT_MCP_EXECUTABLE_PATH") ?? defaultBraveExecutablePath

  if (usesExtensionMode(options)) {
    parts.push("--extension")
    parts.push("--executable-path", quoteCommandArg(executablePath))
    parts.push(
      "--user-data-dir",
      quoteCommandArg(getProjectEnv("PLAYWRIGHT_MCP_USER_DATA_DIR") ?? defaultBraveUserDataDir),
    )
  } else {
    parts.push("--executable-path", quoteCommandArg(executablePath))
    parts.push("--user-data-dir", quoteCommandArg(`${amistadDirectory}/brave-profile`))
    parts.push("--sandbox")
  }

  if (options.headless && !usesExtensionMode(options)) {
    parts.push("--headless")
  }

  return parts.join(" ")
}

export function usesExtensionMode(options: BrowserLaunchOptions) {
  return !options.managedBrowser
}

function quoteCommandArg(value: string) {
  return `"${value.replace(/"/g, '\\"')}"`
}
