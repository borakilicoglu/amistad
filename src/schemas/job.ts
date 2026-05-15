import { z } from "zod"

export const jobSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().min(1),
  workMode: z.enum(["remote", "hybrid", "onsite"]),
  level: z.enum(["junior", "mid", "senior"]),
  url: z.url(),
  source: z.literal("linkedin"),
  posted: z.string().min(1).optional(),
  easyApply: z.boolean().optional(),
})

export const jobsSchema = z.array(jobSchema)

export type Job = z.infer<typeof jobSchema>
