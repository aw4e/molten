import { AnthropicProvider } from "./anthropic.js";
import { OpenAiProvider } from "./openai.js";
import { GeminiProvider } from "./gemini.js";
import { TencentHunyuanProvider } from "./hunyuan.js";
import { MiMoProvider } from "./mimo.js";
import type { AiProvider } from "./types.js";

export type { AiProvider };
export { MAX_TOKENS } from "./types.js";

function createProvider(): AiProvider {
  const provider = (process.env["AI_PROVIDER"] ?? "anthropic").toLowerCase();
  switch (provider) {
    case "openai":           return new OpenAiProvider();
    case "gemini":           return new GeminiProvider();
    case "tencent-hunyuan":  return new TencentHunyuanProvider();
    case "mimo":             return new MiMoProvider();
    case "anthropic":
    default:                 return new AnthropicProvider();
  }
}

export const aiClient: AiProvider = createProvider();
