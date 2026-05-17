import type { JobReport } from "./report.js"

export function formatJobReportMarkdown(report: JobReport) {
  const lines = [
    "# Amistad Job Report",
    "",
    "## Search Context",
    "",
    ...(report.metadata
      ? [
          `- Role: ${report.metadata.profile.role}`,
          `- Location: ${report.metadata.profile.location}`,
          `- Work modes: ${report.metadata.profile.workModes.join(", ")}`,
          `- Level: ${report.metadata.profile.level}`,
          `- Date posted: ${formatDatePosted(report.metadata.datePosted)}`,
          `- Collected at: ${report.metadata.collectedAt}`,
        ]
      : ["- Search context unavailable"]),
    "",
    "## Summary",
    "",
    `- Total jobs: ${report.totalJobs}`,
    `- Companies: ${report.totalCompanies}`,
    `- Jobs with descriptions: ${report.describedJobs}`,
    `- Easy Apply: ${report.easyApplyCount}`,
    "",
    "## Work Modes",
    "",
    `- Remote: ${report.workModes.remote}`,
    `- Hybrid: ${report.workModes.hybrid}`,
    `- On-site: ${report.workModes.onsite}`,
    "",
    "## Levels",
    "",
    `- Junior: ${report.levels.junior}`,
    `- Mid: ${report.levels.mid}`,
    `- Senior: ${report.levels.senior}`,
    "",
    "## Top Keywords",
    "",
    ...report.keywords.slice(0, 10).map((entry) => `- ${entry.keyword}: ${entry.count}`),
    "",
    "## Top Companies",
    "",
    ...report.companies.slice(0, 10).map((entry) => `- ${entry.company}: ${entry.count}`),
    "",
    "## Ranked Jobs",
    "",
  ]

  for (const [index, job] of report.rankedJobs.entries()) {
    lines.push(`${index + 1}. ${job.title} - ${job.company} (${job.score})`)
    lines.push(`   ${job.reasons.join(", ") || "no profile signals"}`)
    lines.push(`   ${job.url}`)
  }

  return `${lines.join("\n").trimEnd()}\n`
}

function formatDatePosted(datePosted: "past-24-hours" | "past-week" | "past-month") {
  if (datePosted === "past-24-hours") return "Past 24 hours"
  if (datePosted === "past-week") return "Past week"
  return "Past month"
}
