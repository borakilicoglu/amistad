export type ExtractedLinkedinJobCard = {
  id: string
  title: string
  company: string
  location: string
  workMode: "remote" | "hybrid" | "onsite" | null
  posted: string
  easyApply: boolean
}

