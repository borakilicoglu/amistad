import type { Command } from "commander"
import { encode } from "@toon-format/toon"
import { writeFileSync } from "node:fs"
import pc from "picocolors"
import { printHeader } from "../core/output/terminal.js"
import { readJobs } from "../core/storage/search-profile.js"
import type { Job } from "../schemas/job.js"

function formatJobsMarkdown(jobs: Job[]) {
  const lines = ["# Amistad Jobs", ""]

  for (const job of jobs) {
    lines.push(`## ${job.title}`)
    lines.push("")
    lines.push(`- Company: ${job.company}`)
    lines.push(`- Location: ${job.location}`)
    lines.push(`- Work mode: ${job.workMode}`)
    lines.push(`- Level: ${job.level}`)
    lines.push(`- Source: ${job.source}`)
    lines.push(`- URL: ${job.url}`)
    lines.push("")
  }

  return `${lines.join("\n").trimEnd()}\n`
}

export function registerExportCommand(program: Command) {
  program
    .command("export")
    .description("Export saved jobs")
    .option("--format <format>", "Export format: json, markdown, or toon", "json")
    .option("--output <path>", "Write export to a file")
    .action((options: { format?: string; output?: string }) => {
      const format = options.format ?? "json"
      const jobs = readJobs()

      if (!jobs) {
        console.log(pc.yellow("No saved jobs found."))
        console.log(pc.dim("Run `amistad linkedin search --save` first."))
        process.exitCode = 1
        return
      }

      if (format !== "json" && format !== "markdown" && format !== "toon") {
        console.log(pc.red(`Unsupported export format: ${format}`))
        console.log(pc.dim("Use `json`, `markdown`, or `toon`."))
        process.exitCode = 1
        return
      }

      const output =
        format === "json"
          ? `${JSON.stringify(jobs, null, 2)}\n`
          : format === "toon"
            ? `${encode({ jobs })}\n`
            : formatJobsMarkdown(jobs)

      if (options.output) {
        writeFileSync(options.output, output, "utf8")
        console.log(pc.green(`Exported ${jobs.length} jobs to ${options.output}`))
        return
      }

      if (format !== "json") {
        printHeader()
      }

      console.log(output.trimEnd())
    })
}
