import { writeFileSync } from "node:fs"
import type { Command } from "commander"
import { encode } from "@toon-format/toon"
import pc from "picocolors"
import { printHeader } from "../core/output/terminal.js"
import { formatJobReportMarkdown } from "../core/reporting/markdown.js"
import { createJobReport } from "../core/reporting/report.js"
import { readJobResults, readSearchProfile } from "../core/storage/search-profile.js"

export function registerReportCommand(program: Command) {
  program
    .command("report")
    .description("Create a report from saved jobs")
    .option("--format <format>", "Report format: pretty, json, markdown, or toon", "pretty")
    .option("--output <path>", "Write report to a file")
    .action((options: { format?: string; output?: string }) => {
      const format = options.format ?? "pretty"
      const results = readJobResults()

      if (!results) {
        console.log(pc.yellow("No saved jobs found."))
        console.log(pc.dim("Run `amistad linkedin search` first."))
        process.exitCode = 1
        return
      }

      if (!isSupportedFormat(format)) {
        console.log(pc.red(`Unsupported report format: ${format}`))
        console.log(pc.dim("Use `pretty`, `json`, `markdown`, or `toon`."))
        process.exitCode = 1
        return
      }

      const report = createJobReport(results.jobs, readSearchProfile(), results.metadata)
      const output =
        format === "json"
          ? `${JSON.stringify({ report }, null, 2)}\n`
          : format === "toon"
            ? `${encode({ report })}\n`
            : formatJobReportMarkdown(report)

      if (options.output) {
        writeFileSync(options.output, output, "utf8")
        console.log(pc.green(`Reported ${results.jobs.length} jobs to ${options.output}`))
        return
      }

      if (format === "pretty") {
        printHeader()
      }

      console.log(output.trimEnd())
    })
}

function isSupportedFormat(format: string) {
  return format === "pretty" || format === "json" || format === "markdown" || format === "toon"
}
