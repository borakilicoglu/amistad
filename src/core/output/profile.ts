import pc from "picocolors"
import type { SearchProfile } from "../../schemas/search-profile.js"

export function printSearchProfile(profile: SearchProfile, savedTo?: string) {
  console.log("")
  console.log(pc.bold(pc.green("Job search profile")))
  console.log(`${pc.dim("role:")} ${profile.role}`)
  console.log(`${pc.dim("location:")} ${profile.location}`)
  console.log(`${pc.dim("workModes:")} ${profile.workModes.join(", ")}`)
  console.log(`${pc.dim("level:")} ${profile.level}`)
  console.log(`${pc.dim("createdAt:")} ${profile.createdAt}`)

  if (savedTo) {
    console.log(`${pc.dim("savedTo:")} ${savedTo}`)
  }
}
