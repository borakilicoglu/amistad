#!/usr/bin/env node

import { Command } from "commander"
import pc from "picocolors"
import { registerConfigCommand } from "./commands/config.js"
import { registerDoctorCommand } from "./commands/doctor.js"
import { registerExportCommand } from "./commands/export.js"
import { registerJobsCommand } from "./commands/jobs.js"
import { registerLinkedinCommand } from "./commands/linkedin/search.js"
import { registerProfileCommand } from "./commands/profile.js"
import { getHeaderText, printHeaderReveal } from "./core/output/terminal.js"

const program = new Command()

program
  .name("amistad")
  .version("0.1.0")
  .addHelpText("beforeAll", getHeaderText())
  .action(async () => {
    await printHeaderReveal()
    console.log(pc.dim("Commands:"))
    console.log(pc.dim("  amistad profile"))
    console.log(pc.dim("  amistad jobs"))
    console.log(pc.dim("  amistad export"))
    console.log(pc.dim("  amistad linkedin search"))
    console.log(pc.dim("  amistad config"))
    console.log(pc.dim("  amistad doctor"))
    console.log(pc.dim("  amistad --help"))
  })

registerProfileCommand(program)
registerJobsCommand(program)
registerExportCommand(program)
registerLinkedinCommand(program)
registerConfigCommand(program)
registerDoctorCommand(program)

program.parse()
