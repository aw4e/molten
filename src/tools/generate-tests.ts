import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { aiClient } from "../core/ai-client.js";
import { auditContract } from "../core/auditor.js";
import { extractJson } from "../core/json-extract.js";
import { withRetry } from "../core/ai/retry.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

const DISCLAIMER =
  "\n\n---\n⚠️ *AI-generated tests. Review for correctness and run with `forge test` before relying on coverage.*";

const TEST_SYSTEM = `You are a Solidity security testing expert specializing in Foundry.

Given a Solidity contract and its audit findings, generate a complete Foundry test file that:
1. Tests each critical and high severity finding with a proof-of-concept exploit
2. Verifies the vulnerable behavior (test should PASS when vulnerability exists)
3. Includes clear comments explaining the attack vector

Respond ONLY with JSON:
{
  "contractName": "string",
  "testCode": "string (complete Foundry .t.sol file content)",
  "testCount": number,
  "coveredFindings": ["string"]
}

Requirements for testCode:
- Valid Solidity >=0.8.0
- Import forge-std/Test.sol
- Use vm.expectRevert, vm.prank, deal() appropriately
- Each test function named test_<VulnerabilityName>()
- setUp() function that deploys the contract under test`;

interface TestGenResult {
  contractName: string;
  testCode: string;
  testCount: number;
  coveredFindings: string[];
}

export function registerGenerateTestsTool(server: McpServer): void {
  server.tool(
    "generate_test_cases",
    "Generate Foundry security test cases for a Solidity contract. Automatically audits the contract and produces proof-of-concept exploit tests for critical and high findings.",
    {
      source_code: z.string().min(10).describe("Solidity source code to generate tests for"),
      focus_findings: z
        .string()
        .optional()
        .describe("Optional: comma-separated finding titles to focus on (otherwise uses all critical/high)"),
    },
    async ({ source_code, focus_findings }): Promise<CallToolResult> => {
      try {
        const audit = await auditContract(source_code);

        const targetFindings = audit.findings.filter(
          (f) => f.severity === "critical" || f.severity === "high"
        );

        if (targetFindings.length === 0) {
          return {
            content: [{
              type: "text",
              text: `## Test Generation\n\nNo critical or high findings found in audit (score: ${audit.securityScore}/100).\nContract appears secure — no exploit tests needed.`,
            }],
          };
        }

        const findingsText = targetFindings
          .map((f, i) => `${i + 1}. [${f.severity.toUpperCase()}] ${f.title}\n   ${f.description}\n   Line: ${f.line ?? "unknown"}`)
          .join("\n\n");

        const focusNote = focus_findings
          ? `\n\nFocus on these findings: ${focus_findings}`
          : "";

        const result = await withRetry(async () => {
          const text = await aiClient.complete(
            TEST_SYSTEM,
            `Contract:\n\`\`\`solidity\n${source_code}\n\`\`\`\n\nAudit Findings:\n${findingsText}${focusNote}`,
            4096
          );
          return JSON.parse(extractJson(text)) as TestGenResult;
        });

        const lines = [
          `## Generated Foundry Tests — ${result.contractName}`,
          ``,
          `**Tests generated**: ${result.testCount}`,
          `**Covered findings**: ${result.coveredFindings.join(", ")}`,
          ``,
          `### Test File`,
          `\`\`\`solidity`,
          result.testCode,
          `\`\`\``,
          ``,
          `### Usage`,
          `\`\`\`bash`,
          `forge test --match-contract ${result.contractName}Test -vvv`,
          `\`\`\``,
        ];

        return { content: [{ type: "text", text: lines.join("\n") + DISCLAIMER }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        return {
          content: [{ type: "text", text: `Test generation failed: ${msg}` }],
          isError: true,
        };
      }
    }
  );
}
