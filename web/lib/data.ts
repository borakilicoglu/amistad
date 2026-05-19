import { readFile } from "node:fs/promises"
import { join } from "node:path"

export type Job = {
  id: string
  title: string
  company: string
  location: string
  workMode: "remote" | "hybrid" | "onsite"
  level: "junior" | "mid" | "senior"
  url: string
  posted?: string
  easyApply?: boolean
  description?: string
}

export type SearchMetadata = {
  profile: {
    role: string
    location: string
    workModes: Array<"remote" | "hybrid" | "onsite">
    level: "all" | "junior" | "mid" | "senior"
  }
  datePosted: "past-24-hours" | "past-week" | "past-month"
  collectedAt: string
}

export type DashboardData = {
  metadata: SearchMetadata | null
  jobs: Job[]
}

export async function readDashboardData(): Promise<DashboardData> {
  const jobsPath = join(process.cwd(), "..", ".amistad", "jobs.json")
  const raw = await readFile(jobsPath, "utf8")
  const parsed = JSON.parse(raw) as DashboardData | Job[]

  if (Array.isArray(parsed)) {
    return {
      metadata: null,
      jobs: parsed,
    }
  }

  return parsed
}

export function summarizeJobs(jobs: Job[]) {
  const companies = new Set(jobs.map((job) => job.company))
  const easyApply = jobs.filter((job) => job.easyApply).length
  const workModes = count(jobs, ["remote", "hybrid", "onsite"], (job) => job.workMode)
  const levels = count(jobs, ["junior", "mid", "senior"], (job) => job.level)
  const topCompanies = countCompanies(jobs).slice(0, 6)
  const topKeywords = countKeywords(jobs).slice(0, 6)

  return {
    totalJobs: jobs.length,
    totalCompanies: companies.size,
    easyApply,
    describedJobs: jobs.filter((job) => job.description).length,
    workModes,
    levels,
    topCompanies,
    topKeywords,
  }
}

function count<T extends string>(jobs: Job[], keys: readonly T[], select: (job: Job) => T) {
  const values = Object.fromEntries(keys.map((key) => [key, 0])) as Record<T, number>
  for (const job of jobs) values[select(job)] += 1
  return values
}

function countCompanies(jobs: Job[]) {
  const counts = new Map<string, number>()
  for (const job of jobs) counts.set(job.company, (counts.get(job.company) ?? 0) + 1)
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label))
}

function countKeywords(jobs: Job[]) {
  const keywords = ["ai", "react", "typescript", "node.js", "python", "docker", "aws", "kubernetes"]
  return keywords
    .map((keyword) => ({
      label: keyword,
      value: jobs.filter((job) => includesKeyword(job, keyword)).length,
    }))
    .filter((entry) => entry.value > 0)
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label))
}

function includesKeyword(job: Job, keyword: string) {
  const text = `${job.title} ${job.description ?? ""}`.toLowerCase()
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(`(^|[^a-z0-9])${escapedKeyword}($|[^a-z0-9])`, "i").test(text)
}
