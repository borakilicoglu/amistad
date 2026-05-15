import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import {
  readJobs,
  readSearchProfile,
  saveJobs,
  saveSearchProfile,
} from "../src/core/storage/search-profile.js"
import type { SearchProfile } from "../src/schemas/search-profile.js"

describe("search profile storage", () => {
  let originalCwd: string
  let tempDir: string

  beforeEach(() => {
    originalCwd = process.cwd()
    tempDir = mkdtempSync(join(tmpdir(), "amistad-profile-"))
    process.chdir(tempDir)
  })

  afterEach(() => {
    process.chdir(originalCwd)
    rmSync(tempDir, { recursive: true, force: true })
  })

  it("returns null when no stored state exists", () => {
    expect(readSearchProfile()).toBeNull()
    expect(readJobs()).toBeNull()
  })

  it("round-trips a profile and saved jobs", () => {
    const profile: SearchProfile = {
      role: "Full Stack Developer",
      location: "Remote",
      workModes: ["remote"],
      level: "mid" as const,
      createdAt: "2026-05-15T10:00:00.000Z",
    }
    const jobs = [
      {
        id: "123",
        title: "Senior Full Stack Developer",
        company: "Amistad",
        location: "Remote",
        workMode: "remote" as const,
        level: "senior" as const,
        url: "https://www.linkedin.com/jobs/view/123/",
        source: "linkedin" as const,
      },
    ]

    saveSearchProfile(profile)
    saveJobs(jobs)

    expect(readSearchProfile()).toEqual(profile)
    expect(readJobs()).toEqual(jobs)
  })
})
