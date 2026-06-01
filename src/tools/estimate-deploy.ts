import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { formatGwei } from "viem";
import { getMantleClient } from "../core/mantle-client.js";
import { aiClient } from "../core/ai-client.js";
import { extractJson } from "../core/json-extract.js";
import { withRetry } from "../core/ai/retry.js";
import type { Network } from "../types/index.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

const DISCLAIMER =
  "\n\n---\n⚠️ *Gas estimate is AI-approximated from source size and complexity — not compiled bytecode. Use `forge snapshot` for production budgeting.*";

const ESTIMATE_SYSTEM = `You are a Solidity gas estimation expert.

Estimate the deployment gas cost for the given Solidity contract based on:
- Bytecode size (approximate from source complexity)
- Constructor logic complexity
- Number of state variables initialized at deployment
- External library dependencies

Respond ONLY with JSON:
{
  "estimatedDeployGas": number,
  "estimatedBytecodeBytes": number,
  "constructorGas": number,
  "initGas": number,
  "breakdown": "string",
  "confidence": "high" | "medium" | "low"
}

Rules for estimation:
- Base: 21000 (tx) + 200 per bytecode byte + 32000 (contract creation opcode)
- Each SSTORE in constructor: +20000
- Each external call in constructor: +2100
- Average Solidity contract: 3000-8000 bytecode bytes`;

interface DeployEstimate {
  estimatedDeployGas: number;
  estimatedBytecodeBytes: number;
  constructorGas: number;
  initGas: number;
  breakdown: string;
  confidence: string;
}

export function registerEstimateDeployTool(server: McpServer): void {
  server.tool(
    "estimate_deployment_cost",
    "Estimate the MNT cost to deploy a Solidity contract on Mantle using current gas prices. Returns gas estimate, bytecode size approximation, and MNT cost breakdown.",
    {
      source_code: z.string().min(10).describe("Solidity source code to estimate deployment cost for"),
      network: z
        .enum(["mainnet", "sepolia"])
        .default("mainnet")
        .describe("Mantle network to use for live gas price"),
    },
    async ({ source_code, network }): Promise<CallToolResult> => {
      try {
        const [estimate, gasPrice] = await Promise.all([
          withRetry(async () => {
            const text = await aiClient.complete(
              ESTIMATE_SYSTEM,
              `Estimate deployment gas for:\n\`\`\`solidity\n${source_code}\n\`\`\``,
              1024
            );
            return JSON.parse(extractJson(text)) as DeployEstimate;
          }),
          getMantleClient(network as Network).getGasPrice(),
        ]);

        const deployGasBig = BigInt(estimate.estimatedDeployGas);
        const costWei = deployGasBig * gasPrice;
        // BigInt division preserves precision — avoid Number(costWei) which loses digits above 9e15
        const costMntWhole = Number(costWei / BigInt(1e18));
        const costMntFrac = Number(costWei % BigInt(1e18)) / 1e18;
        const costMnt = costMntWhole + costMntFrac;
        const gasPriceGwei = formatGwei(gasPrice);

        const confidenceIcon =
          estimate.confidence === "high" ? "✅" :
          estimate.confidence === "medium" ? "⚠️" : "❓";

        const lines = [
          `## Deployment Cost Estimate — Mantle ${network}`,
          ``,
          `**Estimated Deploy Gas**: ${estimate.estimatedDeployGas.toLocaleString()} gas`,
          `**Estimated Bytecode Size**: ~${estimate.estimatedBytecodeBytes.toLocaleString()} bytes`,
          `**Current Gas Price**: ${gasPriceGwei} gwei`,
          `**Estimated Cost**: ~${costMnt.toFixed(6)} MNT`,
          `**Confidence**: ${confidenceIcon} ${estimate.confidence}`,
          ``,
          `### Gas Breakdown`,
          estimate.breakdown,
          ``,
          `| Component | Gas |`,
          `|-----------|-----|`,
          `| Constructor logic | ${estimate.constructorGas.toLocaleString()} |`,
          `| State initialization | ${estimate.initGas.toLocaleString()} |`,
          `| Bytecode deployment | ${(estimate.estimatedDeployGas - estimate.constructorGas - estimate.initGas).toLocaleString()} |`,
          `| **Total** | **${estimate.estimatedDeployGas.toLocaleString()}** |`,
        ];

        return { content: [{ type: "text", text: lines.join("\n") + DISCLAIMER }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        return {
          content: [{ type: "text", text: `Deployment estimate failed: ${msg}` }],
          isError: true,
        };
      }
    }
  );
}
