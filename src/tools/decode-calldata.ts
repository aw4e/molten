import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { decodeFunctionData, type Abi } from "viem";
import { aiClient } from "../core/ai-client.js";
import { extractJson } from "../core/json-extract.js";
import { withRetry } from "../core/ai/retry.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

const DECODE_SYSTEM = `You are an EVM calldata decoder. Decode the given hex calldata from a Mantle transaction.

Identify:
1. The function selector (first 4 bytes)
2. The likely function name and signature from the selector
3. The decoded parameters if possible

Respond ONLY with JSON:
{
  "selector": "string (0x + 4 bytes hex)",
  "functionName": "string or null",
  "functionSignature": "string or null",
  "params": [
    { "name": "string or null", "type": "string", "value": "string" }
  ],
  "confidence": "high" | "medium" | "low",
  "notes": "string"
}`;

interface AiDecodeResult {
  selector: string;
  functionName: string | null;
  functionSignature: string | null;
  params: Array<{ name: string | null; type: string; value: string }>;
  confidence: string;
  notes: string;
}

export function registerDecodeCalldataTool(server: McpServer): void {
  server.tool(
    "decode_calldata",
    "Decode raw hex calldata from a Mantle transaction into human-readable function name and parameters. Provide an ABI for exact decoding, or let AI infer from the selector.",
    {
      calldata: z
        .string()
        .min(10)
        .describe("Raw hex calldata (e.g. 0xa9059cbb000...)")
        .refine((v) => /^0x([0-9a-fA-F]{2})+$/.test(v), "Must be valid even-length hex starting with 0x"),
      abi: z
        .string()
        .optional()
        .describe("Optional: JSON ABI string for exact decoding"),
    },
    async ({ calldata: rawCalldata, abi }): Promise<CallToolResult> => {
      const calldata = rawCalldata.toLowerCase();
      // Try deterministic ABI decode first
      if (abi) {
        try {
          const parsedAbi = JSON.parse(abi) as Abi;
          const decoded = decodeFunctionData({ abi: parsedAbi, data: calldata as `0x${string}` });

          const lines = [
            `## Calldata Decoded (ABI)`,
            ``,
            `**Function**: \`${decoded.functionName}\``,
            `**Selector**: \`${calldata.slice(0, 10)}\``,
            ``,
            `**Arguments**:`,
          ];

          if (decoded.args && decoded.args.length > 0) {
            for (let i = 0; i < decoded.args.length; i++) {
              lines.push(`- arg[${i}]: \`${String(decoded.args[i])}\``);
            }
          } else {
            lines.push(`- *(no arguments)*`);
          }

          return { content: [{ type: "text", text: lines.join("\n") }] };
        } catch {
          // ABI decode failed, fall through to AI
        }
      }

      // AI fallback
      try {
        const result = await withRetry(async () => {
          const text = await aiClient.complete(
            DECODE_SYSTEM,
            `Decode this Mantle transaction calldata:\n\`${calldata}\``,
            1024
          );
          return JSON.parse(extractJson(text)) as AiDecodeResult;
        });

        const confidenceIcon =
          result.confidence === "high" ? "✅" :
          result.confidence === "medium" ? "⚠️" : "❓";

        const lines = [
          `## Calldata Decoded (AI)`,
          ``,
          `**Selector**: \`${result.selector}\``,
          `**Function**: ${result.functionName ?? "unknown"}`,
          `**Signature**: ${result.functionSignature ? `\`${result.functionSignature}\`` : "unknown"}`,
          `**Confidence**: ${confidenceIcon} ${result.confidence}`,
        ];

        if (result.params.length > 0) {
          lines.push(``, `**Parameters**:`);
          for (const p of result.params) {
            const name = p.name ? `${p.name} ` : "";
            lines.push(`- ${name}(${p.type}): \`${p.value}\``);
          }
        }

        if (result.notes) {
          lines.push(``, `**Notes**: ${result.notes}`);
        }

        lines.push(``, `> Tip: Provide the contract ABI for exact deterministic decoding.`);

        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        return {
          content: [{ type: "text", text: `Calldata decode failed: ${msg}` }],
          isError: true,
        };
      }
    }
  );
}
