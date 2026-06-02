import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { aiClient } from "../core/ai-client.js";
import { extractJson } from "../core/json-extract.js";
import { withRetry } from "../core/ai/retry.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

const DISCLAIMER =
  "\n\n---\n⚠️ *AI-assisted comparison only. Manually verify regressions before merging.*";

const COMPARE_SYSTEM = `You are a Solidity security expert. Compare two versions of a smart contract and identify security and gas changes.

Respond ONLY with JSON:
{
  "regressions": [
    {
      "severity": "critical" | "high" | "medium" | "low",
      "title": "string",
      "description": "string",
      "recommendation": "string"
    }
  ],
  "improvements": [
    {
      "title": "string",
      "description": "string"
    }
  ],
  "gasRegression": boolean,
  "gasImprovement": boolean,
  "gasSummary": "string",
  "verdict": "safe" | "review_required" | "regression_detected",
  "summary": "string"
}

regressions = new vulnerabilities introduced in v2 that did not exist in v1.
improvements = vulnerabilities present in v1 that are fixed in v2.
verdict: "safe" if no regressions, "review_required" if medium/low regressions, "regression_detected" if critical/high.`;

interface CompareRegression {
  severity: string;
  title: string;
  description: string;
  recommendation: string;
}

interface CompareImprovement {
  title: string;
  description: string;
}

interface CompareResult {
  regressions: CompareRegression[];
  improvements: CompareImprovement[];
  gasRegression: boolean;
  gasImprovement: boolean;
  gasSummary: string;
  verdict: string;
  summary: string;
}

export function registerCompareTool(server: McpServer): void {
  server.tool(
    "compare_contracts",
    "Compare two versions of a Solidity contract to detect security regressions, fixed vulnerabilities, and gas changes. Use before merging a refactor.",
    {
      source_v1: z.string().min(10).describe("Original contract source code (before changes)"),
      source_v2: z.string().min(10).describe("Updated contract source code (after changes)"),
    },
    async ({ source_v1, source_v2 }): Promise<CallToolResult> => {
      try {
        const result = await withRetry(async () => {
          const text = await aiClient.complete(
            COMPARE_SYSTEM,
            `Compare these two contract versions:\n\n## V1 (original):\n\`\`\`solidity\n${source_v1}\n\`\`\`\n\n## V2 (updated):\n\`\`\`solidity\n${source_v2}\n\`\`\``,
            3000
          );
          return JSON.parse(extractJson(text)) as CompareResult;
        });

        const verdictIcon =
          result.verdict === "safe" ? "✅" :
          result.verdict === "review_required" ? "⚠️" : "🚨";

        const lines: string[] = [
          `## Contract Comparison Report`,
          ``,
          `**Verdict**: ${verdictIcon} ${result.verdict.replace(/_/g, " ").toUpperCase()}`,
          `**Summary**: ${result.summary}`,
        ];

        if (result.regressions.length > 0) {
          lines.push(``, `### 🚨 Regressions (${result.regressions.length}) — New issues in V2`);
          for (const r of result.regressions) {
            lines.push(
              ``,
              `#### [${r.severity.toUpperCase()}] ${r.title}`,
              r.description,
              `Fix: ${r.recommendation}`
            );
          }
        } else {
          lines.push(``, `### ✅ No Regressions — no new vulnerabilities introduced`);
        }

        if (result.improvements.length > 0) {
          lines.push(``, `### ✅ Improvements (${result.improvements.length}) — Issues fixed in V2`);
          for (const i of result.improvements) {
            lines.push(``, `- **${i.title}**: ${i.description}`);
          }
        }

        lines.push(``, `### Gas Changes`);
        if (result.gasRegression) lines.push(`⚠️ Gas regression detected.`);
        if (result.gasImprovement) lines.push(`✅ Gas improved.`);
        if (!result.gasRegression && !result.gasImprovement) lines.push(`No significant gas change.`);
        if (result.gasSummary) lines.push(result.gasSummary);

        return { content: [{ type: "text", text: lines.join("\n") + DISCLAIMER }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        return {
          content: [{ type: "text", text: `Comparison failed: ${msg}` }],
          isError: true,
        };
      }
    }
  );
}
