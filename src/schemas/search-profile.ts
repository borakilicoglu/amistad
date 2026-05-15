import { z } from "zod"

export const searchProfileSchema = z.object({
  role: z.string().min(1),
  location: z.string().min(1),
  workModes: z.array(z.enum(["remote", "hybrid", "onsite"])).min(1),
  level: z.enum(["all", "junior", "mid", "senior"]),
  createdAt: z.string().datetime(),
})

export type SearchProfile = z.infer<typeof searchProfileSchema>
