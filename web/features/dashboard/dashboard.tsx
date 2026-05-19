"use client"

import { useMemo, useState } from "react"
import type { DashboardData } from "../../lib/data"
import { AppShell } from "../../components/layout/app-shell"
import { JobDetail, JobRow } from "../jobs/components"
import { FilterGroup, panelClass } from "../../shared/ui"

type Props = {
  data: DashboardData
  summary: {
    totalJobs: number
    totalCompanies: number
    easyApply: number
    describedJobs: number
    workModes: Record<"remote" | "hybrid" | "onsite", number>
    levels: Record<"junior" | "mid" | "senior", number>
    topCompanies: Array<{ label: string; value: number }>
    topKeywords: Array<{ label: string; value: number }>
  }
}

const modes = ["all", "remote", "hybrid", "onsite"] as const
const levels = ["all", "junior", "mid", "senior"] as const

export function Dashboard({ data, summary }: Props) {
  const [mode, setMode] = useState<(typeof modes)[number]>("all")
  const [level, setLevel] = useState<(typeof levels)[number]>("all")
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState(data.jobs[0]?.id ?? "")

  const jobs = useMemo(
    () =>
      data.jobs.filter(
        (job) =>
          (mode === "all" || job.workMode === mode) &&
          (level === "all" || job.level === level) &&
          includesQuery(job, query),
      ),
    [data.jobs, level, mode, query],
  )

  const selectedJob = jobs.find((job) => job.id === selectedId) ?? jobs[0]

  return (
    <AppShell
      data={data}
      filterDrawer={
        <div className="grid gap-6">
          <div className="grid gap-1">
            <h2 className="m-0 text-lg font-semibold">Filters</h2>
            <span className="text-sm text-muted">{jobs.length} matching jobs</span>
          </div>
          <FilterGroup title="Work mode" values={modes} active={mode} onChange={setMode} />
          <FilterGroup title="Level" values={levels} active={level} onChange={setLevel} />
        </div>
      }
      onResetFilters={() => {
        setMode("all")
        setLevel("all")
      }}
      canResetFilters={mode !== "all" || level !== "all"}
      searchValue={query}
      onSearchChange={setQuery}
    >
      <main className="grid gap-7 px-16 py-6 max-md:px-8">
        <section className="grid grid-cols-2 items-start gap-6 max-xl:grid-cols-1">
          <div className="grid gap-0">
            {jobs.length === 0 ? (
              <div className={`${panelClass} p-6 text-muted`}>No jobs match the current filters.</div>
            ) : (
              jobs.map((job) => (
                <div className={`job-item ${job.id === selectedJob?.id ? "job-item-active" : ""}`} key={job.id}>
                  <JobRow job={job} active={job.id === selectedJob?.id} onSelect={() => setSelectedId(job.id)} />
                </div>
              ))
            )}
          </div>

          <section className="rounded-lg bg-detail-panel">
            {selectedJob ? <JobDetail job={selectedJob} /> : <div className="p-6 text-muted">Select a job.</div>}
          </section>
        </section>
      </main>
    </AppShell>
  )
}

function includesQuery(job: DashboardData["jobs"][number], query: string) {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return true

  return `${job.title} ${job.company} ${job.location} ${job.description ?? ""}`
    .toLowerCase()
    .includes(normalizedQuery)
}
