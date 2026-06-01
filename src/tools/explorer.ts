import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getContractSource } from "../core/explorer-client.js";

export function registerExplorerTool(server: McpServer): void {
  server.tool(
    "get_contract_source",
    "Fetch verified source code and ABI for any contract on Mantle mainnet or Sepolia from the block explorer. Useful before auditing a deployed contract.",
    {
      address: z
        .string()
        .regex(/^0x[0-9a-fA-F]{40}$/, "Must be a valid 0x contract address")
        .describe("Deployed contract address"),
      network: z
        .enum(["mainnet", "sepolia"])
        .default("mainnet")
        .describe("Mantle network"),
    },
    async ({ address, network }): Promise<CallToolResult> => {
      try {
        const info = await getContractSource(address, network);

        const lines: string[] = [];
        lines.push(`## Contract Source: ${info.address}`);
        lines.push(`**Network:** Mantle ${network}`);
        lines.push("");

        if (!info.isVerified) {
          lines.push("❌ **Not verified** — source code unavailable on explorer.");
          lines.push("");
          lines.push(
            "You can still audit deployed bytecode, but paste source code manually into `audit_contract` for a full analysis.",
          );
          return { content: [{ type: "text", text: lines.join("\n") }] };
        }

        lines.push("✅ **Verified**");
        if (info.contractName) lines.push(`**Contract Name:** ${info.contractName}`);
        if (info.compilerVersion) lines.push(`**Compiler:** ${info.compilerVersion}`);
        if (info.licenseType)    lines.push(`**License:** ${info.licenseType}`);
        lines.push("");

        if (info.abi) {
          lines.push("### ABI");
          lines.push("```json");
          try {
            lines.push(JSON.stringify(JSON.parse(info.abi), null, 2));
          } catch {
            lines.push(info.abi);
          }
          lines.push("```");
          lines.push("");
        }

        if (info.sourceCode) {
          lines.push("### Source Code");
          lines.push("```solidity");
          lines.push(info.sourceCode);
          lines.push("```");
          lines.push("");
          lines.push(
            "> Tip: Pass this source code to `audit_contract` or `analyze_gas` for AI-powered analysis.",
          );
        }

        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text", text: `❌ Explorer lookup failed: ${msg}` }],
          isError: true,
        };
      }
    },
  );
}
