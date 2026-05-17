import { z } from "zod"
import { jobsSchema } from "./job.js"
import { searchProfileSchema } from "./search-profile.js"

export const jobSearchMetadataSchema = z.object({
  profile: searchProfileSchema,
  datePosted: z.enum(["past-24-hours", "past-week", "past-month"]),
  collectedAt: z.string().datetime(),
})

export const jobResultsSchema = z.object({
  metadata: jobSearchMetadataSchema,
  jobs: jobsSchema,
})

export type JobSearchMetadata = z.infer<typeof jobSearchMetadataSchema>
export type JobResults = z.infer<typeof jobResultsSchema>
