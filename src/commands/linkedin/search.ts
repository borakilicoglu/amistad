import { encode } from "@toon-format/toon"
import type { Command } from "commander"
import ora from "ora"
import pc from "picocolors"
import { buildPlaywrightMcpCommand, buildPlaywrightMcpEnv, usesExtensionMode } from "../../core/mcp/playwright-command.js"
import { PlaywrightMcpClient } from "../../core/mcp/playwright-client.js"
import { printJobs } from "../../core/output/jobs.js"
import { printHeader } from "../../core/output/terminal.js"
import { readConfig } from "../../core/storage/config.js"
import { jobsPath, readSearchProfile, saveJobs } from "../../core/storage/search-profile.js"
import { searchLiveLinkedinJobs } from "../../providers/linkedin/live-search.js"

type LinkedinSearchOptions = {
  debug?: boolean
  extension?: boolean
  extensionToken?: string
  format?: string
  headless?: boolean
  json?: boolean
  keepOpen?: boolean
  managedBrowser?: boolean
  newTab?: boolean
  save?: boolean
}

export function registerLinkedinCommand(program: Command) {
  const linkedin = program.command("linkedin").description("LinkedIn automation")

  linkedin
    .command("search")
    .description("Open LinkedIn Jobs and search with your active profile")
    .option("--extension", "Connect through Playwright MCP extension mode (default)")
    .option("--extension-token <token>", "Playwright MCP extension token")
    .option("--headless", "Run Playwright MCP in headless mode")
    .option("--managed-browser", "Launch a separate Brave browser profile instead of extension mode")
    .option("--new-tab", "Open LinkedIn Jobs in a new MCP browser tab")
    .option("--format <format>", "Output format: pretty, json, or toon")
    .option("--json", "Output JSON")
    .option("--save", "Save live LinkedIn results to .amistad/jobs.json")
    .option("--debug", "Print MCP target diagnostics")
    .option("--no-keep-open", "Close the browser session after the search")
    .action(async (options: LinkedinSearchOptions) => {
      const profile = readSearchProfile()

      if (!profile) {
        console.log(pc.yellow("No job search profile found."))
        console.log(pc.dim("Run `amistad profile` first."))
        process.exitCode = 1
        return
      }

      const format = resolveFormat(options, readConfig().defaultFormat)
      if (!format) {
        console.log(pc.red(`Unsupported output format: ${options.format}`))
        console.log(pc.dim("Use `pretty`, `json`, or `toon`."))
        process.exitCode = 1
        return
      }

      const mcp = new PlaywrightMcpClient({
        command: buildPlaywrightMcpCommand(options),
        env: buildPlaywrightMcpEnv(options),
      })
      const spinner = format === "pretty" ? ora("Opening LinkedIn Jobs...").start() : null
      let succeeded = false

      try {
        await mcp.connect()
        if (options.debug) {
          await printMcpDebug(mcp, "before")
        }

        const { jobs, debug } = await searchLiveLinkedinJobs(mcp, profile, options)

        if (options.save) {
          saveJobs(jobs)
        }

        if (options.debug) {
          await printMcpDebug(mcp, "after")
          printDebugPayload("fill", debug.fillResult)
          printDebugPayload("dateFilter", debug.dateFilterResult)
          printDebugPayload("jobCards", debug.jobCardsResult)
        }

        spinner?.succeed(`Found ${jobs.length} LinkedIn jobs for ${profile.role}`)
        if (format === "json") {
          console.log(JSON.stringify({ profile, jobs }, null, 2))
        } else if (format === "toon") {
          console.log(encode({ profile, jobs }))
        } else {
          printHeader()
          printJobs(jobs, `LinkedIn jobs for ${profile.role}`, "Past 24 hours")
          if (options.save) {
            console.log(pc.dim(`savedTo: ${jobsPath}`))
          }
        }

        succeeded = true
        if (options.keepOpen && format === "pretty") {
          console.log(pc.dim(`browser: ${usesExtensionMode(options) ? "extension session" : "Brave"}`))
          console.log(pc.dim("press Ctrl+C to stop the MCP session"))
        }
      } catch (error) {
        spinner?.fail("LinkedIn search failed")
        throw error
      } finally {
        if (!succeeded || !options.keepOpen) {
          await mcp.evaluate("() => window.close()").catch(() => undefined)
          await mcp.close()
        }
      }
    })
}

function resolveFormat(options: LinkedinSearchOptions, defaultFormat: string) {
  if (options.json) return "json"
  if (!options.format) return defaultFormat

  if (options.format === "pretty" || options.format === "json" || options.format === "toon") {
    return options.format
  }

  return null
}

async function printMcpDebug(mcp: PlaywrightMcpClient, label: string) {
  const pageState = await mcp
    .evaluate(`() => ({
      url: location.href,
      title: document.title,
      visibilityState: document.visibilityState,
      hasFocus: document.hasFocus()
    })`)
    .catch((error: unknown) => ({
      error: error instanceof Error ? error.message : String(error),
    }))
  const tabs = await mcp.listTabs().catch((error: unknown) => ({
    error: error instanceof Error ? error.message : String(error),
  }))

  console.log(pc.dim(`[mcp:${label}] page ${JSON.stringify(pageState)}`))
  console.log(pc.dim(`[mcp:${label}] tabs ${JSON.stringify(tabs)}`))
}

function printDebugPayload(label: string, payload: Awaited<ReturnType<PlaywrightMcpClient["evaluate"]>>) {
  console.log(pc.dim(`${label}: ${JSON.stringify(payload.structuredContent ?? payload.content ?? payload)}`))
}
