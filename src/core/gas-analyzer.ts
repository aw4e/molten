import { aiClient, MAX_TOKENS } from "./ai-client.js";
import { extractJson } from "./json-extract.js";
import { gasCache, makeCacheKey } from "./cache.js";
import { GAS_SYSTEM_PROMPT } from "../prompts/gas-system.js";
import type { GasAnalysisResult, RawGasResponse } from "../types/index.js";

export async function analyzeGas(sourceCode: string): Promise<GasAnalysisResult> {
  const cacheKey = makeCacheKey("gas", sourceCode);
  const cached = gasCache.get(cacheKey);
  if (cached) return cached;

  const text = await aiClient.complete(
    GAS_SYSTEM_PROMPT,
    `Analyze gas usage in this contract:\n\`\`\`solidity\n${sourceCode}\n\`\`\``,
    MAX_TOKENS
  );

  const raw = JSON.parse(extractJson(text)) as RawGasResponse;

  const result: GasAnalysisResult = {
    optimizations: raw.optimizations.map((o) => ({
      type: o.type,
      description: o.description,
      estimatedSaving: BigInt(Math.round(o.estimatedSaving)),
      codeSnippet: o.codeSnippet ?? undefined,
      fixedSnippet: o.fixedSnippet ?? undefined,
    })),
    estimatedSavings: BigInt(Math.round(raw.totalEstimatedSaving)),
    savingsPercentage: raw.savingsPercentage,
    summary: raw.summary,
  };

  gasCache.set(cacheKey, result);
  return result;
}
