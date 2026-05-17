import type { McpToolResponse, PlaywrightMcpClient } from "../../core/mcp/playwright-client.js"
import type { SearchProfile } from "../../schemas/search-profile.js"
import {
  buildApplyDatePostedFilterScript,
  buildExtractJobDescriptionScript,
  buildExtractJobCardsScript,
  buildFillLinkedinSearchInputScript,
  type LinkedinDatePostedFilter,
} from "./dom-scripts.js"
import {
  normalizeLinkedinJobs,
  readExtractedLinkedinJobs,
  withLinkedinJobDescription,
} from "./normalize.js"

export const linkedInJobsUrl = "https://www.linkedin.com/jobs/"

export type LiveLinkedinSearchOptions = {
  datePosted: LinkedinDatePostedFilter
  newTab?: boolean
  onProgress?: (message: string) => void
}

export type LiveLinkedinSearchDebug = {
  fillResult: McpToolResponse
  dateFilterResult: McpToolResponse
  jobCardsResult: McpToolResponse
}

export async function searchLiveLinkedinJobs(
  mcp: PlaywrightMcpClient,
  profile: SearchProfile,
  options: LiveLinkedinSearchOptions,
) {
  options.onProgress?.("Opening LinkedIn Jobs...")
  await ensureLinkedinJobsTab(mcp, options)

  options.onProgress?.(`Entering role: ${profile.role}`)
  const fillResult = await mcp.evaluate(buildFillLinkedinSearchInputScript(profile.role))

  options.onProgress?.("Running LinkedIn search...")
  await sleep(2500)
  await mcp.pressKey("Enter")
  await mcp.inspectSnapshot()

  options.onProgress?.("Applying date filter...")
  const dateFilterResult = await mcp.evaluate(buildApplyDatePostedFilterScript(options.datePosted))

  options.onProgress?.("Collecting jobs across result pages...")
  const jobCardsResult = await mcp.evaluate(buildExtractJobCardsScript())
  const jobs = normalizeLinkedinJobs(readExtractedLinkedinJobs(jobCardsResult), profile.level)
  const enrichedJobs = []

  for (const [index, job] of jobs.entries()) {
    options.onProgress?.(`Collecting job details ${index + 1}/${jobs.length}: ${job.company} - ${job.title}`)
    await mcp.navigateTo(job.url)
    const descriptionResult = await mcp.evaluate(buildExtractJobDescriptionScript())
    enrichedJobs.push(withLinkedinJobDescription(job, readLinkedinJobDescription(descriptionResult)))
  }

  return {
    jobs: enrichedJobs,
    debug: {
      fillResult,
      dateFilterResult,
      jobCardsResult,
    } satisfies LiveLinkedinSearchDebug,
  }
}

function readLinkedinJobDescription(response: McpToolResponse): string {
  const text = response.content?.find((item) => item.type === "text")?.text
  if (!text) {
    return ""
  }

  const resultStart = text.indexOf("### Result")
  const codeStart = text.indexOf("### Ran Playwright code")
  if (resultStart === -1 || codeStart === -1) {
    return ""
  }

  const json = text.slice(resultStart + "### Result".length, codeStart).trim()
  const parsed = JSON.parse(json) as { description?: string }
  return parsed.description ?? ""
}

async function ensureLinkedinJobsTab(
  mcp: PlaywrightMcpClient,
  options: LiveLinkedinSearchOptions,
) {
  if (options.newTab) {
    await mcp.openTab(linkedInJobsUrl)
    return
  }

  await mcp.navigateTo(linkedInJobsUrl)
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
