import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { analyzeGas } from "../core/gas-analyzer.js";
import type { GasAnalysisResult } from "../types/index.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

const DISCLAIMER =
  "\n\n---\n⚠️ *AI-estimated savings are indicative. Benchmark with Hardhat Gas Reporter or Foundry's gas snapshots before relying on these numbers.*";

function formatGasResult(result: GasAnalysisResult): string {
  const lines: string[] = [
    `## Gas Analysis Report`,
    ``,
    `**Estimated Total Savings**: ${result.estimatedSavings.toLocaleString()} gas (~${result.savingsPercentage.toFixed(1)}% reduction)`,
    `**Summary**: ${result.summary}`,
  ];

  if (result.optimizations.length === 0) {
    lines.push(``, `No optimizations found.`);
    return lines.join("\n") + DISCLAIMER;
  }

  lines.push(``, `### Optimizations (${result.optimizations.length})`);

  for (const opt of result.optimizations) {
    lines.push(
      ``,
      `#### [${opt.type.toUpperCase()}] ${opt.description}`,
      `Estimated Saving: ${opt.estimatedSaving.toLocaleString()} gas`
    );
    if (opt.codeSnippet) {
      lines.push(`Before:\n\`\`\`solidity\n${opt.codeSnippet}\n\`\`\``);
    }
    if (opt.fixedSnippet) {
      lines.push(`After:\n\`\`\`solidity\n${opt.fixedSnippet}\n\`\`\``);
    }
  }

  return lines.join("\n") + DISCLAIMER;
}

export function registerGasTool(server: McpServer): void {
  server.tool(
    "analyze_gas",
    "Analyze a Solidity contract for gas inefficiencies. Returns concrete optimizations with before/after code snippets and estimated gas savings.",
    {
      source_code: z
        .string()
        .min(10)
        .describe("Solidity source code to analyze"),
    },
    async ({ source_code }): Promise<CallToolResult> => {
      try {
        const result = await analyzeGas(source_code);
        return {
          content: [{ type: "text", text: formatGasResult(result) }],
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        return {
          content: [{ type: "text", text: `Gas analysis failed: ${msg}` }],
          isError: true,
        };
      }
    }
  );
}
