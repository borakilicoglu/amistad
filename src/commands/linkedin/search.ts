import { encode } from "@toon-format/toon"
import { cancel, isCancel, select } from "@clack/prompts"
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
import {
  linkedinDatePostedLabels,
  type LinkedinDatePostedFilter,
} from "../../providers/linkedin/dom-scripts.js"

type LinkedinSearchOptions = {
  debug?: boolean
  datePosted?: string
  extension?: boolean
  extensionToken?: string
  format?: string
  headless?: boolean
  json?: boolean
  keepOpen?: boolean
  managedBrowser?: boolean
  newTab?: boolean
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
    .option("--date-posted <filter>", "Date posted filter: past-24-hours, past-week, or past-month")
    .option("--json", "Output JSON")
    .option("--debug", "Print MCP target diagnostics")
    .option("--keep-open", "Keep the browser session open after the search")
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

      if (format === "pretty") {
        printHeader()
      }

      const datePosted = await resolveDatePostedFilter(options)
      if (!datePosted) {
        process.exitCode = 1
        return
      }

      const mcp = new PlaywrightMcpClient({
        command: buildPlaywrightMcpCommand(options),
        env: buildPlaywrightMcpEnv(options),
      })
      let spinner = format === "pretty" ? ora("Preparing LinkedIn search...").start() : null
      let succeeded = false

      try {
        await mcp.connect()
        if (options.debug) {
          await printMcpDebug(mcp, "before")
        }

        const { jobs, debug } = await searchLiveLinkedinJobs(mcp, profile, {
          ...options,
          datePosted,
          onProgress: (message) => {
            if (spinner) {
              spinner.succeed()
              spinner = ora(message).start()
            }
          },
        })

        if (spinner) {
          spinner.succeed()
          spinner = ora("Saving jobs...").start()
        }
        saveJobs(jobs, {
          profile,
          datePosted,
          collectedAt: new Date().toISOString(),
        })

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
          printJobs(jobs, `LinkedIn jobs for ${profile.role}`, linkedinDatePostedLabels[datePosted])
          console.log(pc.dim(`savedTo: ${jobsPath}`))
        }

        succeeded = true
        if (options.keepOpen && format === "pretty") {
          console.log(pc.dim(`browser: ${usesExtensionMode(options) ? "extension session" : "Brave"}`))
          console.log(pc.dim("press Ctrl+C to stop the MCP session"))
          await waitForInterrupt(mcp)
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

async function resolveDatePostedFilter(options: LinkedinSearchOptions): Promise<LinkedinDatePostedFilter | null> {
  if (options.datePosted) {
    if (isLinkedinDatePostedFilter(options.datePosted)) {
      return options.datePosted
    }

    console.log(pc.red(`Unsupported date posted filter: ${options.datePosted}`))
    console.log(pc.dim("Use `past-24-hours`, `past-week`, or `past-month`."))
    return null
  }

  const selection = await select({
    message: "Date posted",
    options: [
      { value: "past-24-hours", label: "Past 24 hours" },
      { value: "past-week", label: "Past week" },
      { value: "past-month", label: "Past month" },
    ],
    initialValue: "past-24-hours",
  })

  if (isCancel(selection)) {
    cancel("LinkedIn search cancelled")
    return null
  }

  return isLinkedinDatePostedFilter(selection) ? selection : null
}

function isLinkedinDatePostedFilter(value: string): value is LinkedinDatePostedFilter {
  return value === "past-24-hours" || value === "past-week" || value === "past-month"
}

async function waitForInterrupt(mcp: PlaywrightMcpClient) {
  await new Promise<void>((resolve) => {
    const wasRaw = process.stdin.isRaw

    const finish = async () => {
      process.off("SIGINT", onSigint)
      process.stdin.off("data", onData)
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(wasRaw ?? false)
      }
      process.stdin.pause()
      console.log("")
      console.log(pc.dim("stopping MCP session"))
      await mcp.close()
      resolve()
    }

    const onSigint = () => {
      void finish()
    }

    const onData = (chunk: Buffer | string) => {
      const text = typeof chunk === "string" ? chunk : chunk.toString("utf8")
      if (text.includes("\u0003")) {
        void finish()
      }
    }

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true)
    }
    process.stdin.resume()
    process.once("SIGINT", onSigint)
    process.stdin.on("data", onData)
  })
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
