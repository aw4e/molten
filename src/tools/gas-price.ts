import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { formatGwei, formatEther } from "viem";
import { getMantleClient } from "../core/mantle-client.js";
import type { Network } from "../types/index.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export function registerGasPriceTool(server: McpServer): void {
  server.tool(
    "get_mantle_gas_price",
    "Fetch the current gas price on Mantle mainnet or Sepolia in wei, Gwei, and MNT per million gas units.",
    {
      network: z
        .enum(["mainnet", "sepolia"])
        .default("mainnet")
        .describe("Mantle network"),
    },
    async ({ network }): Promise<CallToolResult> => {
      try {
        const client = getMantleClient(network as Network);
        const gasPrice = await client.getGasPrice();

        const gweiStr = formatGwei(gasPrice);
        const mntPerMGas = Number(gasPrice * 1_000_000n) / 1e18;

        const lines = [
          `## Mantle Gas Price — ${network}`,
          ``,
          `| Unit | Value |`,
          `|------|-------|`,
          `| Wei | ${gasPrice.toLocaleString()} |`,
          `| Gwei | ${gweiStr} |`,
          `| MNT / 1M gas | ~${mntPerMGas.toFixed(6)} MNT |`,
          ``,
          `> Use this value in \`analyze_gas\` as \`gas_price_gwei\` for accurate MNT cost estimates.`,
        ];

        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        return {
          content: [{ type: "text", text: `Gas price fetch failed: ${msg}` }],
          isError: true,
        };
      }
    }
  );
}
