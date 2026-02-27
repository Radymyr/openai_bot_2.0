import type { ContextMessage } from "../addNewContext.js";

export type AIProviderName = "groq" | "openai";

export interface AIProvider {
  complete(messages: ContextMessage[]): Promise<string | null>;
}

export class AIProviderError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "AIProviderError";
    this.status = status;
  }
}
