import Anthropic from "@anthropic-ai/sdk";
import { withRetry } from "./retry.js";
import type { AiProvider } from "./types.js";
import { MAX_TOKENS } from "./types.js";

export class AnthropicProvider implements AiProvider {
  readonly name = "anthropic";
  private readonly client: Anthropic;
  private readonly model: string;

  constructor() {
    this.client = new Anthropic({ apiKey: process.env["ANTHROPIC_API_KEY"] });
    this.model = process.env["ANTHROPIC_MODEL"] ?? "claude-sonnet-4-6";
  }

  async complete(system: string, user: string, maxTokens = MAX_TOKENS): Promise<string> {
    return withRetry(async () => {
      const msg = await this.client.messages.create({
        model: this.model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: user }],
      });
      const first = msg.content[0];
      if (!first || first.type !== "text") throw new Error("Unexpected Anthropic response type");
      return first.text;
    });
  }
}
