import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { aiClient } from "../core/ai-client.js";
import { extractJson } from "../core/json-extract.js";
import type { AiErrorResponse } from "../types/index.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

const EXPLAIN_SYSTEM = `You are a Solidity/EVM expert. Given a raw error or revert message from the Mantle Network, explain it clearly.

Respond ONLY with JSON:
{
  "plainEnglish": "string",
  "possibleCauses": ["string"],
  "suggestedFixes": ["string"]
}`;

export function registerExplainTool(server: McpServer): void {
  server.tool(
    "explain_error",
    "Decode and explain an EVM revert reason or error message from Mantle in plain English with actionable fixes.",
    {
      error: z.string().min(1).describe("Raw error message, revert reason, or hex-encoded error data"),
      context: z
        .string()
        .optional()
        .describe("Optional: contract source code or function name for better context"),
    },
    async ({ error, context }): Promise<CallToolResult> => {
      try {
        const userContent = context
          ? `Error: ${error}\n\nContext:\n${context}`
          : `Error: ${error}`;

        const text = await aiClient.complete(EXPLAIN_SYSTEM, userContent, 1024);
        const parsed = JSON.parse(extractJson(text)) as AiErrorResponse;

        const output = [
          `## Error Explanation`,
          ``,
          `**Raw**: \`${error}\``,
          ``,
          `**Plain English**: ${parsed.plainEnglish}`,
          ``,
          `**Possible Causes**:`,
          ...parsed.possibleCauses.map((c) => `- ${c}`),
          ``,
          `**Suggested Fixes**:`,
          ...parsed.suggestedFixes.map((f) => `- ${f}`),
        ].join("\n");

        return { content: [{ type: "text", text: output }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        return {
          content: [{ type: "text", text: `Failed to explain error: ${msg}` }],
          isError: true,
        };
      }
    }
  );
}
