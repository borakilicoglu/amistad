import pc from "picocolors"

export const banner = String.raw`
    ___              _      __            __
   /   |  ____ ___  (_)____/ /_____ _____/ /
  / /| | / __ '__ \/ / ___/ __/ __ '/ __  /
 / ___ |/ / / / / / (__  ) /_/ /_/ / /_/ /
/_/  |_/_/ /_/ /_/_/____/\__/\__,_/\__,_/
`

function colorBanner() {
  const lines = banner.replace(/^\n/, "").trimEnd().split("\n")

  return [
    pc.cyan(lines[0] ?? ""),
    pc.bold(pc.cyan(lines[1] ?? "")),
    pc.bold(pc.cyan(lines[2] ?? "")),
    pc.bold(pc.cyan(lines[3] ?? "")),
    pc.bold(pc.cyan(lines[4] ?? "")),
  ].join("\n")
}

function rawBannerLines() {
  return banner.replace(/^\n/, "").trimEnd().split("\n")
}

function colorBannerLines() {
  return colorBanner().split("\n")
}

function scanBannerLines(activeIndex: number) {
  return rawBannerLines()
    .map((line, index) => (index === activeIndex ? pc.bold(pc.cyan(line)) : pc.dim(pc.cyan(line))))
    .join("\n")
}

export function getHeaderText() {
  return `${colorBanner()}

${pc.bold(pc.cyan("Amistad"))}
${pc.cyan("Your terminal-native job search agent.")}
`
}

export function printHeader() {
  console.log(getHeaderText())
}

export async function printHeaderReveal() {
  console.log(colorBannerLines().join("\n"))
  await sleep(120)

  const lines = rawBannerLines()
  for (let index = 0; index < lines.length; index += 1) {
    process.stdout.write(`\x1b[${lines.length}A`)
    process.stdout.write(scanBannerLines(index))
    process.stdout.write("\n")
    await sleep(70)
  }

  process.stdout.write(`\x1b[${lines.length}A`)
  process.stdout.write(colorBannerLines().join("\n"))
  process.stdout.write("\n")
  console.log("")
  console.log(pc.bold(pc.cyan("Amistad")))
  console.log(pc.cyan("Your terminal-native job search agent."))
  console.log("")
}

export function statusLine(label: string, ok: boolean, detail: string) {
  const icon = ok ? pc.green("OK") : pc.yellow("WARN")

  console.log(`${icon} ${pc.bold(label)} ${pc.dim(detail)}`)
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
