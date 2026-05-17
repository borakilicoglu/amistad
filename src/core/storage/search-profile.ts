import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { jobsSchema, type Job } from "../../schemas/job.js"
import { jobResultsSchema, type JobSearchMetadata } from "../../schemas/job-results.js"
import { searchProfileSchema, type SearchProfile } from "../../schemas/search-profile.js"

export type { SearchProfile } from "../../schemas/search-profile.js"

export const amistadDirectory = ".amistad"
export const searchProfilePath = join(amistadDirectory, "search-profile.json")
export const jobsPath = join(amistadDirectory, "jobs.json")

export type SavedJobResults = {
  metadata: JobSearchMetadata | null
  jobs: Job[]
}

export function saveSearchProfile(profile: SearchProfile) {
  const parsedProfile = searchProfileSchema.parse(profile)

  mkdirSync(amistadDirectory, { recursive: true })
  writeFileSync(searchProfilePath, `${JSON.stringify(parsedProfile, null, 2)}\n`, "utf8")
}

export function readSearchProfile(): SearchProfile | null {
  if (!existsSync(searchProfilePath)) {
    return null
  }

  return searchProfileSchema.parse(JSON.parse(readFileSync(searchProfilePath, "utf8")))
}

export function saveJobs(jobs: Job[], metadata: JobSearchMetadata) {
  const parsedResults = jobResultsSchema.parse({
    metadata,
    jobs,
  })

  mkdirSync(amistadDirectory, { recursive: true })
  writeFileSync(jobsPath, `${JSON.stringify(parsedResults, null, 2)}\n`, "utf8")
}

export function readJobs(): Job[] | null {
  return readJobResults()?.jobs ?? null
}

export function readJobResults(): SavedJobResults | null {
  if (!existsSync(jobsPath)) {
    return null
  }

  const parsed = JSON.parse(readFileSync(jobsPath, "utf8")) as unknown
  if (Array.isArray(parsed)) {
    return {
      metadata: null,
      jobs: jobsSchema.parse(parsed),
    }
  }

  return jobResultsSchema.parse(parsed)
}
