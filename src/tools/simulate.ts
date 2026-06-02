import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { simulateTransaction, getGasPrice } from "../core/simulator.js";
import type { Network } from "../types/index.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

const networkSchema = z.enum(["mainnet", "sepolia"]).default("sepolia");

export function registerSimulateTool(server: McpServer): void {
  server.tool(
    "simulate_tx",
    "Simulate a transaction on Mantle Network without broadcasting. Returns gas estimate or revert reason.",
    {
      from: z.string().regex(/^0x[0-9a-fA-F]{40}$/).describe("Sender address"),
      to: z.string().regex(/^0x[0-9a-fA-F]{40}$/).describe("Target contract address"),
      data: z
        .string()
        .regex(/^0x[0-9a-fA-F]*$/)
        .optional()
        .describe("Encoded calldata (hex)"),
      value: z
        .string()
        .regex(/^\d+$/, "Value must be a whole number in wei (e.g. '1000000000000000000' for 1 MNT)")
        .optional()
        .describe("Value in wei as a decimal integer string (e.g. '1000000000000000000' = 1 MNT)"),
      network: networkSchema.describe("mainnet or sepolia (default: sepolia)"),
    },
    async ({ from, to, data, value, network }): Promise<CallToolResult> => {
      try {
        const [result, gasPrice] = await Promise.all([
          simulateTransaction(
            {
              from: from as `0x${string}`,
              to: to as `0x${string}`,
              data: data as `0x${string}` | undefined,
              value: value !== undefined ? BigInt(value) : undefined,
            },
            network as Network
          ),
          getGasPrice(network as Network),
        ]);

        if (result.success) {
          const gasCostWei = result.gasEstimate * gasPrice;
          const gasCostMNT = (Number(gasCostWei) / 1e18).toFixed(8);
          const gasCostGwei = (Number(gasPrice) / 1e9).toFixed(4);

          const text = [
            `## Simulation Result: SUCCESS`,
            ``,
            `**Gas Estimate**: ${result.gasEstimate.toLocaleString()} gas`,
            `**Gas Price**: ${gasPrice.toString()} wei (${gasCostGwei} Gwei)`,
            `**Estimated Cost**: ~${gasCostMNT} MNT`,
          ].join("\n");

          return { content: [{ type: "text", text }] };
        } else {
          const text = [
            `## Simulation Result: REVERT`,
            ``,
            `**Revert Reason**: ${result.revertReason ?? "Unknown"}`,
            ``,
            `Use \`explain_error\` tool to decode this revert reason.`,
          ].join("\n");

          return { content: [{ type: "text", text }] };
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        return {
          content: [{ type: "text", text: `Simulation failed: ${msg}` }],
          isError: true,
        };
      }
    }
  );

}
