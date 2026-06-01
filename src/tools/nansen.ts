import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getWalletIntelligence } from "../core/nansen-client.js";

export function registerNansenTool(server: McpServer): void {
  server.tool(
    "get_wallet_intel",
    "Look up onchain intelligence for a wallet or contract address via Nansen AI — entity labels, smart money status, exchange/fund/hacker classification.",
    {
      address: z
        .string()
        .regex(/^0x[0-9a-fA-F]{40}$/, "Must be a valid 0x Ethereum address")
        .describe("Wallet or contract address to look up"),
    },
    async ({ address }): Promise<CallToolResult> => {
      try {
        const intel = await getWalletIntelligence(address);

        const lines: string[] = [];
        lines.push(`## Wallet Intelligence: ${intel.address}`);
        lines.push("");

        if (intel.entityName) {
          lines.push(`**Entity:** ${intel.entityName}`);
        }

        const flags: string[] = [];
        if (intel.isSmartMoney) flags.push("🧠 Smart Money");
        if (intel.isExchange)   flags.push("🏦 Exchange");
        if (intel.isFund)       flags.push("💰 Fund / VC");
        if (intel.isHacker)     flags.push("⚠️ Known Exploiter");

        if (flags.length > 0) {
          lines.push(`**Classification:** ${flags.join(" | ")}`);
        }

        if (intel.transactionCount !== null) {
          lines.push(`**Transaction Count:** ${intel.transactionCount.toLocaleString()}`);
        }

        if (intel.labels.length > 0) {
          lines.push("");
          lines.push("### Labels");
          for (const lbl of intel.labels) {
            lines.push(`- \`${lbl.category}\`: ${lbl.label}`);
          }
        } else {
          lines.push("");
          lines.push("*No Nansen labels found for this address.*");
        }

        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text", text: `❌ Nansen lookup failed: ${msg}` }],
          isError: true,
        };
      }
    },
  );
}
