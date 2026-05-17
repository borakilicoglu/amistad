import { describe, expect, it } from "vitest"
import {
  normalizeLinkedinJobs,
  readExtractedLinkedinJobs,
  withLinkedinJobDescription,
} from "../src/providers/linkedin/normalize.js"

describe("LinkedIn normalization", () => {
  it("parses extracted cards from MCP text output", () => {
    const jobs = readExtractedLinkedinJobs({
      content: [
        {
          type: "text",
          text: `### Result
{"jobs":[{"id":"42","title":"Junior Developer","company":"Acme","location":"Remote","workMode":"remote"}]}
### Ran Playwright code`,
        },
      ],
    })

    expect(jobs).toEqual([
      {
        id: "42",
        title: "Junior Developer",
        company: "Acme",
        location: "Remote",
        workMode: "remote",
      },
    ])
  })

  it("filters incomplete cards and infers levels from titles", () => {
    const jobs = normalizeLinkedinJobs(
      [
        {
          id: "1",
          title: "Junior Frontend Developer",
          company: "Acme",
          location: "Remote",
          workMode: "remote",
          posted: "",
          easyApply: false,
        },
        {
          id: "2",
          title: "Principal Engineer",
          company: "Beta",
          location: "Istanbul",
          workMode: "hybrid",
          posted: "",
          easyApply: false,
        },
        {
          id: "",
          title: "Incomplete",
          company: "Gamma",
          location: "Remote",
          workMode: "remote",
          posted: "",
          easyApply: false,
        },
      ],
      "all",
    )

    expect(jobs).toEqual([
      expect.objectContaining({
        id: "1",
        level: "junior",
        url: "https://www.linkedin.com/jobs/view/1/",
      }),
      expect.objectContaining({
        id: "2",
        level: "senior",
        url: "https://www.linkedin.com/jobs/view/2/",
      }),
    ])
  })

  it("uses the profile level when the title has no signal", () => {
    const jobs = normalizeLinkedinJobs(
      [
        {
          id: "3",
          title: "Software Engineer",
          company: "Delta",
          location: "Remote",
          workMode: "onsite",
          posted: "",
          easyApply: false,
        },
      ],
      "mid",
    )

    expect(jobs[0]?.level).toBe("mid")
  })

  it("adds detail-page descriptions to normalized jobs", () => {
    const [job] = normalizeLinkedinJobs(
      [
        {
          id: "4",
          title: "Software Engineer",
          company: "Echo",
          location: "Remote",
          workMode: "remote",
          posted: "",
          easyApply: false,
        },
      ],
      "mid",
    )

    expect(withLinkedinJobDescription(job!, "About the role")).toEqual(
      expect.objectContaining({
        id: "4",
        description: "About the role",
      }),
    )
  })
})
