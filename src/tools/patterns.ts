import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { aiClient } from "../core/ai-client.js";
import { extractJson } from "../core/json-extract.js";
import type { AiPatternResponse, MantlePatternType } from "../types/index.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

const DISCLAIMER =
  "\n\n---\n⚠️ *AI-assisted pattern check only. Review findings manually and consult Mantle documentation before production deployment.*";

const PATTERN_SYSTEM = `You are an expert in Mantle Network smart contract patterns.

Check the provided Solidity contract for compliance with the specified Mantle pattern:
- "rwa": Real World Asset tokenization patterns — proper access control, pausability, compliance hooks, USDY/mETH integration
- "meth": mETH (Mantle ETH staking) integration patterns — correct interface, unstaking delays, slashing handling
- "layerzero": LayerZero cross-chain messaging on Mantle — correct endpoint usage, gas configuration, retry logic
- "general": General Mantle L2 best practices — L1 fee awareness, block time handling, MNT gas token usage

Respond ONLY with JSON:
{
  "pattern": "rwa" | "meth" | "layerzero" | "general",
  "compliant": boolean,
  "issues": [
    {
      "severity": "error" | "warning" | "info",
      "description": "string",
      "line": number | null
    }
  ],
  "recommendations": ["string"]
}`;

export function registerPatternsTool(server: McpServer): void {
  server.tool(
    "check_mantle_patterns",
    "Check a Solidity contract for compliance with Mantle-specific patterns: RWA, mETH staking, LayerZero bridge, or general L2 best practices.",
    {
      source_code: z.string().min(10).describe("Solidity source code to check"),
      pattern: z
        .enum(["rwa", "meth", "layerzero", "general"])
        .describe("Pattern to check: rwa | meth | layerzero | general"),
    },
    async ({ source_code, pattern }): Promise<CallToolResult> => {
      try {
        const text = await aiClient.complete(
          PATTERN_SYSTEM,
          `Check this contract for the "${pattern}" pattern:\n\`\`\`solidity\n${source_code}\n\`\`\``,
          2048
        );

        const result = JSON.parse(extractJson(text)) as AiPatternResponse;

        const patternLabels: Record<MantlePatternType, string> = {
          rwa: "Real World Asset",
          meth: "mETH Staking",
          layerzero: "LayerZero Bridge",
          general: "General Mantle L2",
        };

        const output = [
          `## Pattern Check: ${patternLabels[result.pattern]}`,
          ``,
          `**Status**: ${result.compliant ? "✓ COMPLIANT" : "✗ NON-COMPLIANT"}`,
          ``,
          result.issues.length > 0
            ? [
                `### Issues (${result.issues.length})`,
                ...result.issues.map(
                  (i) => `- [${i.severity.toUpperCase()}]${i.line != null ? ` Line ${i.line}:` : ""} ${i.description}`
                ),
              ].join("\n")
            : "No issues found.",
          ``,
          result.recommendations.length > 0
            ? [`### Recommendations`, ...result.recommendations.map((r) => `- ${r}`)].join("\n")
            : "",
        ]
          .filter((l) => l !== "")
          .join("\n");

        return { content: [{ type: "text", text: output + DISCLAIMER }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        return {
          content: [{ type: "text", text: `Pattern check failed: ${msg}` }],
          isError: true,
        };
      }
    }
  );
}
