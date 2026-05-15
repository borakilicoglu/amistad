import type { Command } from "commander"
import { existsSync } from "node:fs"
import pc from "picocolors"
import { printHeader, statusLine } from "../core/output/terminal.js"
import { configPath } from "../core/storage/config.js"
import { jobsPath, searchProfilePath } from "../core/storage/search-profile.js"

export function registerDoctorCommand(program: Command) {
  program
    .command("doctor")
    .description("Check the local Amistad environment")
    .action(() => {
      printHeader()

      const nodeMajor = Number.parseInt(process.versions.node.split(".")[0] ?? "0", 10)
      const isNodeSupported = nodeMajor >= 18

      console.log(pc.bold(pc.cyan("Amistad doctor")))
      console.log("")
      statusLine("Node.js", isNodeSupported, process.version)
      statusLine("Platform", true, `${process.platform} ${process.arch}`)
      statusLine("Package", existsSync("package.json"), "package.json")
      statusLine("TypeScript config", existsSync("tsconfig.json"), "tsconfig.json")
      statusLine("Source entry", existsSync("src/cli.ts"), "src/cli.ts")
      statusLine("Build output", existsSync("dist/cli.js"), "dist/cli.js")
      statusLine("Config", existsSync(configPath), configPath)
      statusLine("Search profile", existsSync(searchProfilePath), searchProfilePath)
      statusLine("Saved jobs", existsSync(jobsPath), jobsPath)
      console.log("")

      if (isNodeSupported) {
        console.log(pc.green("Environment looks ready."))
        return
      }

      console.log(pc.yellow("Node.js 18 or newer is recommended."))
    })
}
