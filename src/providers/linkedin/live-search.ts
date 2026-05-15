import type { McpToolResponse, PlaywrightMcpClient } from "../../core/mcp/playwright-client.js"
import type { SearchProfile } from "../../schemas/search-profile.js"
import { buildApplyPast24HoursFilterScript, buildExtractJobCardsScript, buildFillLinkedinSearchInputScript } from "./dom-scripts.js"
import { normalizeLinkedinJobs, readExtractedLinkedinJobs } from "./normalize.js"

export const linkedInJobsUrl = "https://www.linkedin.com/jobs/"

export type LiveLinkedinSearchOptions = {
  newTab?: boolean
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
  await ensureLinkedinJobsTab(mcp, options)
  const fillResult = await mcp.evaluate(buildFillLinkedinSearchInputScript(profile.role))

  await sleep(2500)
  await mcp.pressKey("Enter")
  await mcp.inspectSnapshot()

  const dateFilterResult = await mcp.evaluate(buildApplyPast24HoursFilterScript())
  const jobCardsResult = await mcp.evaluate(buildExtractJobCardsScript())
  const jobs = normalizeLinkedinJobs(readExtractedLinkedinJobs(jobCardsResult), profile.level)

  return {
    jobs,
    debug: {
      fillResult,
      dateFilterResult,
      jobCardsResult,
    } satisfies LiveLinkedinSearchDebug,
  }
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
