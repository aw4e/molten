import OpenAI from "openai";
import { withRetry } from "./retry.js";
import type { AiProvider } from "./types.js";
import { MAX_TOKENS } from "./types.js";

// Uses MiMo's OpenAI-compatible endpoint — https://token-plan-sgp.xiaomimimo.com/v1
export class MiMoProvider implements AiProvider {
  readonly name = "mimo";
  private readonly client: OpenAI;
  private readonly model: string;

  constructor() {
    const key = process.env["MIMO_API_KEY"];
    if (!key) throw new Error("MIMO_API_KEY is required for MiMo provider");
    this.client = new OpenAI({
      apiKey: key,
      baseURL: "https://token-plan-sgp.xiaomimimo.com/v1",
    });
    this.model = process.env["MIMO_MODEL"] ?? "mimo-v2.5-pro";
  }

  async complete(system: string, user: string, maxTokens = MAX_TOKENS): Promise<string> {
    return withRetry(async () => {
      const res = await this.client.chat.completions.create({
        model: this.model,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      });
      const choice = res.choices[0];
      if (!choice?.message.content) throw new Error("Unexpected MiMo response");
      return choice.message.content;
    });
  }
}
