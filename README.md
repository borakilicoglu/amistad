# Amistad

Amistad is a terminal-native job search agent. It stores a local search profile, drives LinkedIn Jobs through Playwright MCP, applies a recent-posting filter, extracts job cards, and returns structured output for both humans and automation.

## What It Does

- stores a reusable job search profile
- opens LinkedIn Jobs through a logged-in Brave session
- searches by role
- applies the `Past 24 hours` filter
- extracts live LinkedIn job cards
- prints readable terminal output or machine-readable `json` / `toon`
- saves results locally for later listing and export

## Requirements

- Node.js 18 or newer
- pnpm
- Brave Browser
- Playwright MCP browser extension installed in Brave

## Install

```zsh
pnpm install
pnpm build
pnpm link --global
```

After linking, the command is available as:

```zsh
amistad
```

## Playwright MCP Setup

Amistad uses Playwright MCP extension mode by default so it can work with your existing Brave session, including cookies and LinkedIn login state.

Create a local `.env` file:

```zsh
cp .env.example .env
```

Set the extension token:

```env
PLAYWRIGHT_MCP_EXTENSION_TOKEN=
```

Optional overrides:

```env
PLAYWRIGHT_MCP_COMMAND=
PLAYWRIGHT_MCP_EXECUTABLE_PATH=/Applications/Brave Browser.app/Contents/MacOS/Brave Browser
PLAYWRIGHT_MCP_USER_DATA_DIR=/Users/you/Library/Application Support/BraveSoftware/Brave-Browser
```

## First Run

Create a search profile:

```zsh
amistad profile
```

Run a live LinkedIn search:

```zsh
amistad linkedin search
```

The extracted jobs are saved automatically. List saved jobs later:

```zsh
amistad jobs
```

## Commands

```zsh
amistad profile
amistad profile show
amistad jobs
amistad report
amistad export
amistad linkedin search
amistad config
amistad doctor
```

### Live LinkedIn Search

```zsh
amistad linkedin search
amistad linkedin search --json
amistad linkedin search --format toon
```

Useful options:

```txt
--extension-token <token>  Playwright MCP extension token
--managed-browser          Launch a separate Brave profile instead of extension mode
--new-tab                  Open LinkedIn Jobs in a new MCP browser tab
--debug                    Print MCP diagnostics
--keep-open                Keep the browser session open after the search
```

### Output Formats

Human-readable:

```zsh
amistad linkedin search
amistad jobs
amistad report
```

JSON:

```zsh
amistad linkedin search --json
amistad jobs --format json
```

TOON:

```zsh
amistad linkedin search --format toon
amistad jobs --format toon
```

Reports:

```zsh
amistad report
amistad report --format markdown --output .amistad/report.md
amistad report --format json
```

## Local State

Amistad stores local runtime files in `.amistad/`:

```txt
.amistad/
  config.json
  search-profile.json
  jobs.json
```

Generated exports such as `jobs.md` or `jobs.toon` may also be written there.

## Development

Run directly from TypeScript:

```zsh
pnpm dev
```

Build:

```zsh
pnpm build
```

Type-check:

```zsh
pnpm exec tsc --noEmit
```

Start the built CLI:

```zsh
pnpm start
```

## Project Structure

```txt
src/
  commands/
  core/
  providers/
    linkedin/
  schemas/
```

- `commands/` contains CLI command wiring
- `core/` contains storage, output, and MCP infrastructure
- `providers/linkedin/` contains live LinkedIn browser automation and normalization
- `schemas/` contains validated data contracts
