import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { analyzeGas } from "../core/gas-analyzer.js";
import type { GasAnalysisResult } from "../types/index.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

const DISCLAIMER =
  "\n\n---\n⚠️ *AI-estimated savings are indicative. Benchmark with Hardhat Gas Reporter or Foundry's gas snapshots before relying on these numbers.*";

function calcMntCost(gasUnits: bigint, gasPriceGwei: number): string {
  const mnt = (Number(gasUnits) * gasPriceGwei) / 1e9;
  if (mnt < 0.000001) return `<0.000001 MNT`;
  return `~${mnt.toFixed(6)} MNT`;
}

function formatGasResult(result: GasAnalysisResult, gasPriceGwei: number): string {
  const costPer1k = calcMntCost(result.estimatedSavings * 1000n, gasPriceGwei);
  const lines: string[] = [
    `## Gas Analysis Report`,
    ``,
    `**Estimated Total Savings**: ${result.estimatedSavings.toLocaleString()} gas (~${result.savingsPercentage.toFixed(1)}% reduction)`,
    `**MNT Cost Savings**: ${calcMntCost(result.estimatedSavings, gasPriceGwei)} per call · ${costPer1k} per 1,000 calls *(at ${gasPriceGwei} gwei)*`,
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
      gas_price_gwei: z
        .number()
        .positive()
        .max(10000)
        .optional()
        .describe("Mantle gas price in gwei for MNT cost estimation (default: 0.02)"),
    },
    async ({ source_code, gas_price_gwei }): Promise<CallToolResult> => {
      const gwei = gas_price_gwei ?? 0.02;
      try {
        const result = await analyzeGas(source_code);
        return {
          content: [{ type: "text", text: formatGasResult(result, gwei) }],
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
