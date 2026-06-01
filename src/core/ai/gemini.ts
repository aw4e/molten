import { GoogleGenerativeAI } from "@google/generative-ai";
import { withRetry } from "./retry.js";
import type { AiProvider } from "./types.js";
import { MAX_TOKENS } from "./types.js";

export class GeminiProvider implements AiProvider {
  readonly name = "gemini";
  private readonly client: GoogleGenerativeAI;
  private readonly model: string;

  constructor() {
    this.client = new GoogleGenerativeAI(process.env["GEMINI_API_KEY"] ?? "");
    this.model = process.env["GEMINI_MODEL"] ?? "gemini-2.5-flash";
  }

  async complete(system: string, user: string, maxTokens = MAX_TOKENS): Promise<string> {
    return withRetry(async () => {
      const genModel = this.client.getGenerativeModel({
        model: this.model,
        systemInstruction: system,
        generationConfig: { maxOutputTokens: maxTokens },
      });
      const result = await genModel.generateContent(user);
      const text = result.response.text();
      if (!text) throw new Error("Unexpected Gemini response");
      return text;
    });
  }
}
