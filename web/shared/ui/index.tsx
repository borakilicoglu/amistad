export const panelClass = "rounded-lg border border-line bg-panel"

export function FilterGroup<T extends string>({
  title,
  values,
  active,
  onChange,
}: {
  title: string
  values: readonly T[]
  active: T
  onChange: (value: T) => void
}) {
  return (
    <div className="grid gap-3">
      <h3 className="m-0 text-sm font-semibold text-muted">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <button
            key={value}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              active === value
                ? "border-accent bg-accent-soft text-accent"
                : "border-line bg-transparent text-ink"
            }`}
            type="button"
            onClick={() => onChange(value)}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-tag px-2.5 py-1 text-xs text-muted">{children}</span>
}
