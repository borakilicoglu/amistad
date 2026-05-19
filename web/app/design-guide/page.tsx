import { AppShell } from "../../components/layout/app-shell"
import { readDashboardData } from "../../lib/data"
import { Tag, panelClass } from "../../shared/ui"

export const dynamic = "force-dynamic"

const themeTokens = [
  {
    title: "Light Theme",
    tokens: [
      ["page", "#ffffff", "#202124"],
      ["panel", "#f8fafd", "#202124"],
      ["search", "#f4f6fc", "#202124"],
      ["rail", "#1e1f20", "#e8eaed"],
      ["rail hover", "#303134", "#e8eaed"],
      ["rail border", "#c4c6c4", "#202124"],
      ["rail active", "#004a76", "#7fcfff"],
      ["line", "#dadce0", "#202124"],
      ["ink", "#202124", "#ffffff"],
      ["muted", "#5f6368", "#ffffff"],
      ["accent", "#1a73e8", "#ffffff"],
      ["accent soft", "#e8f0fe", "#1a73e8"],
      ["tag", "#f1f3f4", "#5f6368"],
      ["body copy", "#3c4043", "#ffffff"],
      ["detail panel", "#f8fafd", "#202124"],
      ["job hover", "#ededed", "#202124"],
      ["sort value", "#454746", "#ffffff"],
    ],
  },
  {
    title: "Dark Theme",
    tokens: [
      ["page", "#131314", "#e8eaed"],
      ["panel", "#292a2d", "#e8eaed"],
      ["search", "#1e1f20", "#e8eaed"],
      ["rail", "#1e1f20", "#e8eaed"],
      ["rail hover", "#303134", "#e8eaed"],
      ["rail border", "#303134", "#e8eaed"],
      ["rail active", "#004a76", "#7fcfff"],
      ["line", "#3c4043", "#e8eaed"],
      ["ink", "#e8eaed", "#131314"],
      ["muted", "#bdc1c6", "#131314"],
      ["accent", "#8ab4f8", "#131314"],
      ["accent soft", "#1f3b63", "#e8eaed"],
      ["tag", "#303134", "#e8eaed"],
      ["body copy", "#e8eaed", "#131314"],
      ["detail panel", "#1b1b1b", "#e8eaed"],
      ["job hover", "#1b1b1b", "#e8eaed"],
      ["sort value", "#e8eaed", "#131314"],
    ],
  },
] as const

export default async function DesignGuidePage() {
  const data = await readDashboardData()

  return (
    <AppShell data={data}>
      <main className="grid gap-8 px-16 py-6 max-md:px-8">
        <section className="grid gap-2">
          <h2 className="m-0 text-3xl font-semibold">Design Guide</h2>
          <p className="m-0 max-w-3xl text-sm leading-6 text-body-copy">
            Theme tokens, surfaces, and reusable states used by the Amistad web interface.
          </p>
        </section>

        <section className="grid gap-6">
          <h3 className="m-0 text-lg font-semibold">Color Tokens</h3>
          {themeTokens.map((theme) => (
            <div className="grid gap-3" key={theme.title}>
              <h4 className="m-0 text-sm font-semibold text-muted">{theme.title}</h4>
              <div className="grid grid-cols-4 gap-3 max-xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
                {theme.tokens.map(([label, backgroundColor, color]) => (
                  <div className={`${panelClass} overflow-hidden`} key={`${theme.title}-${label}`}>
                    <div
                      className="grid min-h-24 place-items-center"
                      style={{ backgroundColor, color }}
                    >
                      <span className="text-sm font-semibold">{label}</span>
                    </div>
                    <div className="grid gap-1 p-3 text-xs text-muted">
                      <span>{`--color-${label.replaceAll(" ", "-")}`}</span>
                      <span>{backgroundColor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-2 gap-6 max-xl:grid-cols-1">
          <div className={`${panelClass} grid gap-5 p-6`}>
            <h3 className="m-0 text-lg font-semibold">Typography</h3>
            <div className="grid gap-3">
              <div className="text-3xl font-semibold text-ink">Page title</div>
              <div className="text-2xl font-semibold text-ink">Section title</div>
              <div className="text-base text-body-copy">Body copy for job descriptions and supporting context.</div>
              <div className="text-sm text-muted">Muted metadata and helper labels</div>
              <div className="text-sm font-semibold text-accent">Accent action text</div>
            </div>
          </div>

          <div className={`${panelClass} grid gap-5 p-6`}>
            <h3 className="m-0 text-lg font-semibold">Controls</h3>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-full border border-accent bg-accent-soft px-4 py-2 text-sm font-semibold text-accent" type="button">
                Active
              </button>
              <button className="rounded-full border border-line bg-transparent px-4 py-2 text-sm font-semibold text-ink" type="button">
                Default
              </button>
              <button className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-muted opacity-60" disabled type="button">
                Disabled
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Tag>remote</Tag>
              <Tag>senior</Tag>
              <Tag>Easy Apply</Tag>
            </div>
          </div>
        </section>

        <section className="grid gap-4">
          <h3 className="m-0 text-lg font-semibold">Job Rows</h3>
          <div className="grid gap-0">
            <div className="job-item">
              <div className="grid gap-3 rounded-lg px-4 py-6 text-body-copy">
                <span className="flex flex-wrap items-center gap-3 text-sm text-muted">
                  <strong className="font-semibold text-ink">Default Company</strong>
                  <span>remote</span>
                  <span>mid</span>
                </span>
                <span className="text-2xl font-semibold leading-tight">Default job row</span>
              </div>
            </div>
            <div className="job-item">
              <div className="grid gap-3 rounded-lg bg-job-hover px-4 py-6 text-body-copy">
                <span className="flex flex-wrap items-center gap-3 text-sm text-muted">
                  <strong className="font-semibold text-ink">Hover Company</strong>
                  <span>hybrid</span>
                  <span>senior</span>
                </span>
                <span className="text-2xl font-semibold leading-tight">Hover job row</span>
              </div>
            </div>
            <div className="job-item job-item-active">
              <div className="grid gap-3 rounded-lg bg-detail-panel px-4 py-6 text-ink">
                <span className="flex flex-wrap items-center gap-3 text-sm text-muted">
                  <strong className="font-semibold text-ink">Selected Company</strong>
                  <span>onsite</span>
                  <span>junior</span>
                </span>
                <span className="text-2xl font-semibold leading-tight">Selected job row</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  )
}
