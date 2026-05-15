import type { Command } from "commander"
import { encode } from "@toon-format/toon"
import pc from "picocolors"
import { printJobs } from "../core/output/jobs.js"
import { printHeader } from "../core/output/terminal.js"
import { readConfig } from "../core/storage/config.js"
import { readJobs } from "../core/storage/search-profile.js"

export function registerJobsCommand(program: Command) {
  program
    .command("jobs")
    .description("List saved jobs")
    .option("--format <format>", "Output format: pretty, json, or toon")
    .action((options: { format?: string }) => {
      const format = resolveFormat(options, readConfig().defaultFormat)

      if (!format) {
        console.log(pc.red(`Unsupported output format: ${options.format}`))
        console.log(pc.dim("Use `pretty`, `json`, or `toon`."))
        process.exitCode = 1
        return
      }

      const jobs = readJobs()

      if (!jobs) {
        console.log(pc.yellow("No saved jobs found."))
        console.log(pc.dim("Run `amistad linkedin search --save` first."))
        process.exitCode = 1
        return
      }

      if (format === "json") {
        console.log(JSON.stringify({ jobs }, null, 2))
        return
      }

      if (format === "toon") {
        console.log(encode({ jobs }))
        return
      }

      printHeader()
      printJobs(jobs, "Saved jobs")
    })
}

function resolveFormat(options: { format?: string }, defaultFormat: string) {
  if (!options.format) return defaultFormat

  if (options.format === "pretty" || options.format === "json" || options.format === "toon") {
    return options.format
  }

  return null
}
