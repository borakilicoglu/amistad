import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

export function readProjectEnv(path = ".env"): Record<string, string> {
  const envPath = resolve(process.cwd(), path)

  if (!existsSync(envPath)) {
    return {}
  }

  const env: Record<string, string> = {}
  const content = readFileSync(envPath, "utf8")

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) {
      continue
    }

    const separatorIndex = trimmed.indexOf("=")
    if (separatorIndex === -1) {
      continue
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    const rawValue = trimmed.slice(separatorIndex + 1).trim()
    if (!key) {
      continue
    }

    env[key] = unquoteEnvValue(rawValue)
  }

  return env
}

export function getProjectEnv(name: string): string | undefined {
  return process.env[name] ?? readProjectEnv()[name]
}

function unquoteEnvValue(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }

  return value
}
