import { z } from "zod"

export const configSchema = z.object({
  defaultFormat: z.enum(["pretty", "json", "toon"]).default("pretty"),
  defaultLocation: z.string().min(1).default("Remote"),
  defaultRole: z.string().min(1).default("Full Stack Developer"),
})

export type AmistadConfig = z.infer<typeof configSchema>
