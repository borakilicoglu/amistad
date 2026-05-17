import type { Job } from "../../schemas/job.js"
import type { SearchProfile } from "../../schemas/search-profile.js"
import type { JobSearchMetadata } from "../../schemas/job-results.js"

const trackedKeywords = [
  "react",
  "typescript",
  "node.js",
  "next.js",
  "python",
  ".net",
  "aws",
  "azure",
  "docker",
  "kubernetes",
  "postgresql",
  "mongodb",
  "ai",
  "llm",
  "rag",
] as const

export type JobReport = {
  metadata: JobSearchMetadata | null
  totalJobs: number
  totalCompanies: number
  easyApplyCount: number
  describedJobs: number
  workModes: Record<"remote" | "hybrid" | "onsite", number>
  levels: Record<"junior" | "mid" | "senior", number>
  keywords: Array<{ keyword: string; count: number }>
  companies: Array<{ company: string; count: number }>
  rankedJobs: Array<{
    id: string
    title: string
    company: string
    score: number
    reasons: string[]
    url: string
  }>
}

export function createJobReport(
  jobs: Job[],
  profile: SearchProfile | null,
  metadata: JobSearchMetadata | null = null,
): JobReport {
  return {
    metadata,
    totalJobs: jobs.length,
    totalCompanies: new Set(jobs.map((job) => job.company)).size,
    easyApplyCount: jobs.filter((job) => job.easyApply).length,
    describedJobs: jobs.filter((job) => job.description).length,
    workModes: countBy(jobs, ["remote", "hybrid", "onsite"], (job) => job.workMode),
    levels: countBy(jobs, ["junior", "mid", "senior"], (job) => job.level),
    keywords: countKeywords(jobs),
    companies: countCompanies(jobs),
    rankedJobs: rankJobs(jobs, profile),
  }
}

function countBy<T extends string>(
  jobs: Job[],
  keys: readonly T[],
  select: (job: Job) => T,
): Record<T, number> {
  const counts = Object.fromEntries(keys.map((key) => [key, 0])) as Record<T, number>

  for (const job of jobs) {
    counts[select(job)] += 1
  }

  return counts
}

function countKeywords(jobs: Job[]) {
  return trackedKeywords
    .map((keyword) => ({
      keyword,
      count: jobs.filter((job) => includesKeyword(job, keyword)).length,
    }))
    .filter((entry) => entry.count > 0)
    .sort((left, right) => right.count - left.count || left.keyword.localeCompare(right.keyword))
}

function includesKeyword(job: Job, keyword: string) {
  const text = `${job.title} ${job.description ?? ""}`.toLowerCase()
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const pattern = new RegExp(`(^|[^a-z0-9])${escapedKeyword}($|[^a-z0-9])`, "i")
  return pattern.test(text)
}

function countCompanies(jobs: Job[]) {
  const counts = new Map<string, number>()

  for (const job of jobs) {
    counts.set(job.company, (counts.get(job.company) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([company, count]) => ({ company, count }))
    .sort((left, right) => right.count - left.count || left.company.localeCompare(right.company))
}

function rankJobs(jobs: Job[], profile: SearchProfile | null) {
  return jobs
    .map((job) => {
      let score = 0
      const reasons: string[] = []

      if (profile && job.title.toLowerCase().includes(profile.role.toLowerCase())) {
        score += 4
        reasons.push("role match")
      }

      if (profile && profile.workModes.includes(job.workMode)) {
        score += 2
        reasons.push(`${job.workMode} match`)
      }

      if (profile && (profile.level === "all" || profile.level === job.level)) {
        score += 2
        reasons.push(`${job.level} level`)
      }

      if (job.easyApply) {
        score += 1
        reasons.push("Easy Apply")
      }

      if (isRecent(job.posted)) {
        score += 1
        reasons.push("recent")
      }

      return {
        id: job.id,
        title: job.title,
        company: job.company,
        score,
        reasons,
        url: job.url,
      }
    })
    .sort((left, right) => right.score - left.score || left.company.localeCompare(right.company))
    .slice(0, 10)
}

function isRecent(posted: string | undefined) {
  return !!posted && /\b(minutes?|hours?|1 day)\b/i.test(posted)
}
