import type { Command } from "commander"
import { encode } from "@toon-format/toon"
import { cancel, intro, isCancel, multiselect, outro, select, text } from "@clack/prompts"
import ora from "ora"
import pc from "picocolors"
import { printSearchProfile } from "../core/output/profile.js"
import { printHeader, sleep } from "../core/output/terminal.js"
import { readConfig } from "../core/storage/config.js"
import { readSearchProfile, saveSearchProfile, searchProfilePath } from "../core/storage/search-profile.js"
import type { SearchProfile } from "../schemas/search-profile.js"

function exitOnCancel<T>(value: T): Exclude<T, symbol> {
  if (isCancel(value)) {
    cancel("Profile cancelled")
    process.exit(0)
  }

  return value as Exclude<T, symbol>
}

export function registerProfileCommand(program: Command) {
  const profileCommand = program
    .command("profile")
    .description("Create or update your job search profile")

  profileCommand
    .action(async () => {
      const config = readConfig()

      printHeader()
      intro(pc.green("Amistad job profile"))

      const role = await text({
        message: "What role are you looking for?",
        placeholder: config.defaultRole,
        defaultValue: config.defaultRole,
      })
      const selectedRole = exitOnCancel(role)

      const location = await select({
        message: "Job location",
        options: [
          { value: "Remote", label: "Remote" },
          { value: "Istanbul", label: "Istanbul" },
          { value: "Turkey", label: "Turkey" },
          { value: "Europe", label: "Europe" },
        ],
        initialValue: config.defaultLocation,
      })
      const selectedLocation = exitOnCancel(location)

      const workModes = await multiselect({
        message: "Preferred work mode",
        options: [
          { value: "remote", label: "Remote" },
          { value: "hybrid", label: "Hybrid" },
          { value: "onsite", label: "On-site" },
        ],
        required: true,
      })
      const selectedWorkModes = exitOnCancel(workModes)

      const level = await select({
        message: "Experience level",
        options: [
          { value: "all", label: "All" },
          { value: "junior", label: "Junior" },
          { value: "mid", label: "Mid-level" },
          { value: "senior", label: "Senior" },
        ],
      })
      const selectedLevel = exitOnCancel(level)

      const profile: SearchProfile = {
        role: String(selectedRole),
        location: String(selectedLocation),
        workModes: selectedWorkModes,
        level: selectedLevel,
        createdAt: new Date().toISOString(),
      }

      const spinner = ora("Saving profile...").start()

      try {
        saveSearchProfile(profile)
        await sleep(250)
        spinner.succeed("Profile saved")
      } catch (error) {
        spinner.fail("Failed to save profile")
        throw error
      }

      printSearchProfile(profile, searchProfilePath)

      outro("Profile ready")
    })

  profileCommand
    .command("show")
    .description("Show your active job search profile")
    .option("--format <format>", "Output format: pretty, json, or toon", "pretty")
    .action((options: { format?: string }) => {
      const format = resolveFormat(options)

      if (!format) {
        console.log(pc.red(`Unsupported output format: ${options.format}`))
        console.log(pc.dim("Use `pretty`, `json`, or `toon`."))
        process.exitCode = 1
        return
      }

      const profile = readSearchProfile()

      if (!profile) {
        console.log(pc.yellow("No job search profile found."))
        console.log(pc.dim("Run `amistad profile` first."))
        process.exitCode = 1
        return
      }

      if (format === "json") {
        console.log(JSON.stringify({ profile }, null, 2))
        return
      }

      if (format === "toon") {
        console.log(encode({ profile }))
        return
      }

      printHeader()
      printSearchProfile(profile, searchProfilePath)
    })
}

function resolveFormat(options: { format?: string }) {
  if (!options.format) return "pretty"

  if (options.format === "pretty" || options.format === "json" || options.format === "toon") {
    return options.format
  }

  return null
}
