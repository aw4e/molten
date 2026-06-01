import OpenAI from "openai";
import { withRetry } from "./retry.js";
import type { AiProvider } from "./types.js";
import { MAX_TOKENS } from "./types.js";

// Uses Hunyuan's OpenAI-compatible endpoint — no extra SDK needed
export class TencentHunyuanProvider implements AiProvider {
  readonly name = "tencent-hunyuan";
  private readonly client: OpenAI;
  private readonly model: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env["TENCENT_HUNYUAN_API_KEY"] ?? "",
      baseURL: "https://api.hunyuan.cloud.tencent.com/v1",
    });
    this.model = process.env["TENCENT_HUNYUAN_MODEL"] ?? "hunyuan-pro";
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
      if (!choice?.message.content) throw new Error("Unexpected Hunyuan response");
      return choice.message.content;
    });
  }
}
