# Amistad

Amistad is an AI-native developer tooling platform focused on automation, structured outputs, terminal workflows, and MCP-compatible systems.

The project is designed as a modular CLI ecosystem rather than a single-purpose utility.

---

# Vision

Build developer tools that work well for:

- humans
- scripts
- terminals
- automation systems
- AI agents
- MCP workflows

The system should prioritize:
- predictable outputs
- extensibility
- composability
- developer ergonomics
- machine readability

---

# Core Principles

- Type-safe everywhere
- Automation-first architecture
- Human-readable terminal UX
- Machine-readable outputs
- Cross-platform support
- Modular command system
- Minimal dependency footprint
- Structured serialization
- AI-agent compatibility

---

# Tech Stack

## Runtime

- Node.js
- TypeScript

---

## CLI

- Commander
- @clack/prompts
- picocolors
- ora

---

## Validation

- zod

---

## Build

- tsup

---

## Testing

- vitest

---

## Browser Automation

Optional:
- Playwright

---

## MCP

Optional:
- @modelcontextprotocol/sdk

---

# Repository Structure

```txt
src/
  cli.ts

  commands/
    linkedin/
    github/
    export/
    mcp/
    config/

  core/
    search/
    output/
    storage/
    serialization/
    automation/

  providers/
    linkedin/
    github/

  exporters/
    json/
    csv/
    toon/
    markdown/

  schemas/
  types/
  utils/

tests/
```
