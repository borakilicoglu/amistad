import pc from "picocolors"
import type { Job } from "../../schemas/job.js"

export function printJobs(jobs: Job[], title: string, subtitle?: string) {
  console.log("")
  console.log(pc.bold(pc.green(title)))
  if (subtitle) {
    console.log(pc.dim(subtitle))
  }
  console.log("")

  jobs.forEach((job, index) => {
    console.log(`${pc.bold(`${index + 1}. ${job.title}`)}`)
    console.log(`   ${job.company} | ${job.location} | ${job.workMode} | ${job.source}`)
    if (job.posted || job.easyApply !== undefined) {
      const metadata = [job.posted, job.easyApply ? "Easy Apply" : undefined].filter(Boolean)
      console.log(`   ${metadata.join(" | ")}`)
    }
    console.log(`   ${pc.dim(job.url)}`)
    console.log("")
  })
}
