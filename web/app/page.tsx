import { Dashboard } from "../features/dashboard/dashboard"
import { readDashboardData, summarizeJobs } from "../lib/data"

export const dynamic = "force-dynamic"

export default async function Page() {
  const data = await readDashboardData()
  const summary = summarizeJobs(data.jobs)

  return <Dashboard data={data} summary={summary} />
}
