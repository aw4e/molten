import { aiClient, MAX_TOKENS } from "./ai-client.js";
import { extractJson } from "./json-extract.js";
import { withRetry } from "./ai/retry.js";
import { auditCache, makeCacheKey } from "./cache.js";
import { AUDIT_SYSTEM_PROMPT } from "../prompts/audit-system.js";
import type { AuditResult, AiAuditResponse } from "../types/index.js";

export async function auditContract(sourceCode: string): Promise<AuditResult> {
  const cacheKey = makeCacheKey("audit", sourceCode);
  const cached = auditCache.get(cacheKey);
  if (cached) return cached;

  const parsed = await withRetry(async () => {
    const text = await aiClient.complete(
      AUDIT_SYSTEM_PROMPT,
      `Audit this Solidity contract:\n\`\`\`solidity\n${sourceCode}\n\`\`\``,
      MAX_TOKENS
    );
    return JSON.parse(extractJson(text)) as AiAuditResponse;
  });

  const result: AuditResult = {
    sourceCode,
    findings: parsed.findings,
    securityScore: parsed.securityScore,
    gasScore: parsed.gasScore,
    summary: parsed.summary,
    estimatedSavings: parsed.estimatedSavings,
  };

  auditCache.set(cacheKey, result);
  return result;
}
