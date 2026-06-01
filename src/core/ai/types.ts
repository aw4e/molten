export const MAX_TOKENS = 4096 as const;

export interface AiProvider {
  complete(system: string, user: string, maxTokens?: number): Promise<string>;
  readonly name: string;
}
