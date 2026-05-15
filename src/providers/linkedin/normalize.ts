import type { PlaywrightMcpClient } from "../../core/mcp/playwright-client.js"
import { jobsSchema, type Job } from "../../schemas/job.js"
import type { ExtractedLinkedinJobCard } from "./types.js"

export function readExtractedLinkedinJobs(
  response: Awaited<ReturnType<PlaywrightMcpClient["evaluate"]>>,
): ExtractedLinkedinJobCard[] {
  const text = response.content?.find((item) => item.type === "text")?.text
  if (!text) {
    throw new Error("LinkedIn job cards response did not include text output")
  }

  const resultStart = text.indexOf("### Result")
  const codeStart = text.indexOf("### Ran Playwright code")
  if (resultStart === -1 || codeStart === -1) {
    throw new Error("LinkedIn job cards result was not parseable")
  }

  const json = text.slice(resultStart + "### Result".length, codeStart).trim()
  const parsed = JSON.parse(json) as { jobs?: ExtractedLinkedinJobCard[] }
  return parsed.jobs ?? []
}

export function normalizeLinkedinJobs(
  cards: ExtractedLinkedinJobCard[],
  profileLevel: "all" | "junior" | "mid" | "senior",
): Job[] {
  return jobsSchema.parse(
    cards
      .filter((card) => card.id && card.title && card.company && card.location && card.workMode)
      .map((card) => ({
        id: card.id,
        title: card.title,
        company: card.company,
        location: card.location,
        workMode: card.workMode,
        level: inferJobLevel(card.title, profileLevel),
        url: `https://www.linkedin.com/jobs/view/${card.id}/`,
        source: "linkedin" as const,
        posted: card.posted || undefined,
        easyApply: card.easyApply,
      })),
  )
}

function inferJobLevel(
  title: string,
  profileLevel: "all" | "junior" | "mid" | "senior",
): "junior" | "mid" | "senior" {
  if (/\b(intern|internship|junior|jr\.?)\b/i.test(title)) {
    return "junior"
  }

  if (/\b(senior|sr\.?|lead|principal|staff|manager)\b/i.test(title)) {
    return "senior"
  }

  return profileLevel === "all" ? "mid" : profileLevel
}

