import process from "node:process"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"

export type McpToolResponse = {
  content?: Array<{ type?: string; text?: string; data?: string; mimeType?: string }>
  structuredContent?: Record<string, unknown>
  isError?: boolean
  [key: string]: unknown
}

export type PlaywrightMcpClientOptions = {
  command?: string
  env?: Record<string, string>
  connectTool?: string
  navigateTool?: string
  evaluateTool?: string
  pressKeyTool?: string
  snapshotTool?: string
  tabsTool?: string
}

function splitCommand(command: string): { program: string; args: string[] } {
  const parts = command.match(/(?:[^\s"]+|"[^"]*")+/g) ?? []
  if (parts.length === 0) {
    throw new Error("Playwright MCP command is empty")
  }

  return {
    program: parts[0]!.replace(/^"|"$/g, ""),
    args: parts.slice(1).map((part) => part.replace(/^"|"$/g, "")),
  }
}

function collectText(node: unknown): string | null {
  if (!node) {
    return null
  }

  if (typeof node === "string") {
    return node
  }

  if (Array.isArray(node)) {
    return node.map((item) => collectText(item)).filter(Boolean).join("\n") || null
  }

  if (typeof node === "object") {
    const record = node as Record<string, unknown>

    if (typeof record.text === "string") {
      return record.text
    }

    if (typeof record.data === "string") {
      return record.data
    }

    for (const value of Object.values(record)) {
      const nested = collectText(value)
      if (nested) {
        return nested
      }
    }
  }

  return null
}

function inheritedEnv(): Record<string, string> {
  const env: Record<string, string> = {}
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === "string") {
      env[key] = value
    }
  }
  return env
}

export class PlaywrightMcpClient {
  private readonly connectTool: string
  private readonly navigateTool: string
  private readonly evaluateTool: string
  private readonly pressKeyTool: string
  private readonly snapshotTool: string
  private readonly tabsTool: string
  private readonly client: Client
  private readonly transport: StdioClientTransport
  private stderrTail = ""

  constructor(options: PlaywrightMcpClientOptions = {}) {
    const command = splitCommand(options.command ?? "./node_modules/.bin/playwright-mcp --extension")

    this.connectTool = options.connectTool ?? "browser_connect"
    this.navigateTool = options.navigateTool ?? "browser_navigate"
    this.evaluateTool = options.evaluateTool ?? "browser_evaluate"
    this.pressKeyTool = options.pressKeyTool ?? "browser_press_key"
    this.snapshotTool = options.snapshotTool ?? "browser_snapshot"
    this.tabsTool = options.tabsTool ?? "browser_tabs"
    this.transport = new StdioClientTransport({
      command: command.program,
      args: command.args,
      env: {
        ...inheritedEnv(),
        ...options.env,
      },
      cwd: process.cwd(),
      stderr: "pipe",
    })

    this.transport.stderr?.on("data", (chunk: Buffer | string) => {
      const text = typeof chunk === "string" ? chunk : chunk.toString("utf8")
      this.stderrTail = `${this.stderrTail}${text}`.slice(-4000)
    })

    this.client = new Client({
      name: "amistad",
      version: "0.1.0",
    })
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect(this.transport)
      await this.callTool(this.connectTool, {})
    } catch (error) {
      if (isMissingToolError(error, this.connectTool)) {
        return
      }

      throw this.withStderr(error)
    }
  }

  async navigateTo(url: string): Promise<void> {
    await this.callTool(this.navigateTool, { url })
  }

  async listTabs(): Promise<McpToolResponse> {
    return await this.callTool(this.tabsTool, { action: "list" })
  }

  async openTab(url: string): Promise<void> {
    await this.callTool(this.tabsTool, { action: "new", url })
  }

  async evaluate(functionSource: string): Promise<McpToolResponse> {
    return await this.callTool(this.evaluateTool, { function: functionSource })
  }

  async pressKey(key: string): Promise<void> {
    await this.callTool(this.pressKeyTool, { key })
  }

  async inspectSnapshot(): Promise<string> {
    const response = await this.callTool(this.snapshotTool, {})
    return collectText(response.structuredContent) ?? JSON.stringify(response)
  }

  async close(): Promise<void> {
    await this.transport.close().catch(() => undefined)
  }

  private async callTool(name: string, args: Record<string, unknown>): Promise<McpToolResponse> {
    try {
      const response = await this.client.callTool({
        name,
        arguments: args,
      }) as McpToolResponse

      if (response.isError) {
        throw new Error(collectText(response.content) ?? JSON.stringify(response))
      }

      return response
    } catch (error) {
      throw this.withStderr(error)
    }
  }

  private withStderr(error: unknown): Error {
    const message = error instanceof Error ? error.message : String(error)
    const suffix = this.stderrTail.trim() ? `; stderr: ${this.stderrTail.trim()}` : ""
    return new Error(`${message}${suffix}`)
  }
}

function isMissingToolError(error: unknown, toolName: string) {
  const message = error instanceof Error ? error.message : String(error)
  return message.includes(`Tool "${toolName}" not found`) || message.includes(`Unknown tool: ${toolName}`)
}
