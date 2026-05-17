import { describe, expect, it } from "vitest"
import { formatJobReportMarkdown } from "../src/core/reporting/markdown.js"
import { createJobReport } from "../src/core/reporting/report.js"

describe("job reports", () => {
  const jobs = [
    {
      id: "1",
      title: "Full Stack Developer",
      company: "Acme",
      location: "Remote",
      workMode: "remote" as const,
      level: "mid" as const,
      url: "https://www.linkedin.com/jobs/view/1/",
      source: "linkedin" as const,
      posted: "Posted 1 day ago",
      easyApply: true,
      description: "React TypeScript Node.js AWS",
    },
    {
      id: "2",
      title: "Senior Backend Engineer",
      company: "Acme",
      location: "Istanbul",
      workMode: "hybrid" as const,
      level: "senior" as const,
      url: "https://www.linkedin.com/jobs/view/2/",
      source: "linkedin" as const,
      easyApply: false,
      description: "Python Docker Kubernetes",
    },
  ]

  it("summarizes saved jobs and ranks profile matches", () => {
    const report = createJobReport(jobs, {
      role: "Full Stack Developer",
      location: "Remote",
      workModes: ["remote"],
      level: "mid",
      createdAt: "2026-05-17T00:00:00.000Z",
    })

    expect(report.totalJobs).toBe(2)
    expect(report.totalCompanies).toBe(1)
    expect(report.workModes.remote).toBe(1)
    expect(report.keywords).toEqual(
      expect.arrayContaining([
        { keyword: "react", count: 1 },
        { keyword: "typescript", count: 1 },
      ]),
    )
    expect(report.rankedJobs[0]).toEqual(
      expect.objectContaining({
        id: "1",
        score: 10,
      }),
    )
  })

  it("formats markdown reports", () => {
    const markdown = formatJobReportMarkdown(
      createJobReport(jobs, null, {
        profile: {
          role: "Full Stack Developer",
          location: "Remote",
          workModes: ["remote"],
          level: "mid",
          createdAt: "2026-05-17T00:00:00.000Z",
        },
        datePosted: "past-week",
        collectedAt: "2026-05-17T10:00:00.000Z",
      }),
    )

    expect(markdown).toContain("# Amistad Job Report")
    expect(markdown).toContain("## Search Context")
    expect(markdown).toContain("Date posted: Past week")
    expect(markdown).toContain("## Top Keywords")
    expect(markdown).toContain("Acme: 2")
  })
})
