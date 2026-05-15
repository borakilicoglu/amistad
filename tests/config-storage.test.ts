import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { getDefaultConfig, readConfig, saveConfig } from "../src/core/storage/config.js"

describe("config storage", () => {
  let originalCwd: string
  let tempDir: string

  beforeEach(() => {
    originalCwd = process.cwd()
    tempDir = mkdtempSync(join(tmpdir(), "amistad-config-"))
    process.chdir(tempDir)
  })

  afterEach(() => {
    process.chdir(originalCwd)
    rmSync(tempDir, { recursive: true, force: true })
  })

  it("returns defaults when no config file exists", () => {
    expect(readConfig()).toEqual(getDefaultConfig())
  })

  it("round-trips validated config values", () => {
    const config = {
      defaultFormat: "toon" as const,
      defaultLocation: "Istanbul",
      defaultRole: "Platform Engineer",
    }

    saveConfig(config)

    expect(readConfig()).toEqual(config)
  })
})
