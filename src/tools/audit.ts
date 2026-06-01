import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { auditContract } from "../core/auditor.js";
import type { AuditResult } from "../types/index.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

const DISCLAIMER =
  "\n\n---\n⚠️ *AI-assisted analysis only — not a professional security audit. Verify critical findings with Slither, Mythril, or a qualified auditor before mainnet deployment.*";

function formatAuditResult(result: AuditResult): string {
  const lines: string[] = [
    `## Audit Report`,
    ``,
    `**Security Score**: ${result.securityScore}/100`,
    `**Gas Score**: ${result.gasScore}/100`,
    `**Summary**: ${result.summary}`,
  ];

  if (result.estimatedSavings) {
    lines.push(`**Estimated Gas Savings**: ${result.estimatedSavings}`);
  }

  if (result.findings.length === 0) {
    lines.push(``, `No findings.`);
    return lines.join("\n") + DISCLAIMER;
  }

  lines.push(``, `### Findings (${result.findings.length})`);

  for (const f of result.findings) {
    lines.push(
      ``,
      `#### [${f.severity.toUpperCase()}] ${f.title}`,
      f.line != null ? `Line: ${f.line}` : "",
      f.description,
      f.gasImpact ? `Gas Impact: ${f.gasImpact}` : "",
      `Fix: ${f.recommendation}`
    );
  }

  return lines.filter((l) => l !== "").join("\n") + DISCLAIMER;
}

export function registerAuditTool(server: McpServer): void {
  server.tool(
    "audit_contract",
    "Audit a Solidity smart contract for security vulnerabilities and gas inefficiencies. Returns severity-ranked findings with fix recommendations.",
    {
      source_code: z
        .string()
        .min(10)
        .describe("Solidity source code to audit"),
    },
    async ({ source_code }): Promise<CallToolResult> => {
      try {
        const result = await auditContract(source_code);
        return {
          content: [{ type: "text", text: formatAuditResult(result) }],
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        return {
          content: [{ type: "text", text: `Audit failed: ${msg}` }],
          isError: true,
        };
      }
    }
  );
}
