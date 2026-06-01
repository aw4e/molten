import OpenAI from "openai";
import { withRetry } from "./retry.js";
import type { AiProvider } from "./types.js";
import { MAX_TOKENS } from "./types.js";

export class OpenAiProvider implements AiProvider {
  readonly name = "openai";
  private readonly client: OpenAI;
  private readonly model: string;

  constructor() {
    this.client = new OpenAI({ apiKey: process.env["OPENAI_API_KEY"] });
    this.model = process.env["OPENAI_MODEL"] ?? "gpt-4o";
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
      if (!choice?.message.content) throw new Error("Unexpected OpenAI response");
      return choice.message.content;
    });
  }
}
