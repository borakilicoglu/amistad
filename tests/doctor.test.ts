import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { collectDoctorChecks } from "../src/commands/doctor.js"

describe("doctor checks", () => {
  let originalCwd: string
  let tempDir: string

  beforeEach(() => {
    originalCwd = process.cwd()
    tempDir = mkdtempSync(join(tmpdir(), "amistad-doctor-"))
    process.chdir(tempDir)
  })

  afterEach(() => {
    process.chdir(originalCwd)
    rmSync(tempDir, { recursive: true, force: true })
  })

  it("surfaces missing runtime prerequisites", () => {
    const checks = collectDoctorChecks()

    expect(findCheck(checks, "Env file")).toMatchObject({
      ok: false,
      detail: "missing .env; copy .env.example",
    })
    expect(findCheck(checks, "Extension token")).toMatchObject({
      ok: false,
      detail: "missing PLAYWRIGHT_MCP_EXTENSION_TOKEN",
    })
    expect(findCheck(checks, "Search profile")).toMatchObject({
      ok: false,
      detail: "missing; run `amistad profile`",
    })
  })

  it("marks stored config and profile as valid when they parse", () => {
    mkdirSync(".amistad", { recursive: true })
    writeFileSync(
      ".amistad/config.json",
      JSON.stringify({
        defaultFormat: "pretty",
        defaultLocation: "Remote",
        defaultRole: "Full Stack Developer",
      }),
    )
    writeFileSync(
      ".amistad/search-profile.json",
      JSON.stringify({
        role: "Full Stack Developer",
        location: "Remote",
        workModes: ["remote"],
        level: "mid",
        createdAt: "2026-05-15T10:00:00.000Z",
      }),
    )

    const checks = collectDoctorChecks()

    expect(findCheck(checks, "Config")).toMatchObject({
      ok: true,
      detail: ".amistad/config.json valid",
    })
    expect(findCheck(checks, "Search profile")).toMatchObject({
      ok: true,
      detail: ".amistad/search-profile.json valid",
    })
  })
})

function findCheck(checks: ReturnType<typeof collectDoctorChecks>, label: string) {
  return checks.find((check) => check.label === label)
}
