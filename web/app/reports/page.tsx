import { AppShell } from "../../components/layout/app-shell"
import { readDashboardData } from "../../lib/data"

export const dynamic = "force-dynamic"

export default async function ReportsPage() {
  const data = await readDashboardData()

  return (
    <AppShell data={data}>
      <main className="px-16 py-6 max-md:px-8" />
    </AppShell>
  )
}
