import { Groq } from "groq-sdk";
import type { ContextMessage } from "../../addNewContext.js";
import {
  GROQ_FALLBACK_MODEL,
  GROQ_PRIMARY_MODEL,
} from "../../config/runtime.js";
import { AIProviderError, type AIProvider } from "../types.js";

export class GroqProvider implements AIProvider {
  private client: Groq;

  constructor(apiKey: string | undefined) {
    if (!apiKey) {
      throw new AIProviderError("GROQ_API_KEY is missing");
    }

    this.client = new Groq({ apiKey });
  }

  async complete(messages: ContextMessage[]): Promise<string | null> {
    try {
      return await this.completeWithModel(messages, GROQ_PRIMARY_MODEL);
    } catch (error) {
      const status = this.extractStatus(error);
      const errorText = this.errorText(error).toLowerCase();
      const shouldFallback =
        status === 429 ||
        status === 403 ||
        errorText.includes("rate") ||
        errorText.includes("quota") ||
        errorText.includes("permission") ||
        errorText.includes("not allowed") ||
        errorText.includes("model");

      if (shouldFallback && GROQ_FALLBACK_MODEL !== GROQ_PRIMARY_MODEL) {
        try {
          console.log("shouldFallback:", shouldFallback);

          return await this.completeWithModel(messages, GROQ_FALLBACK_MODEL);
        } catch (fallbackError) {
          const fallbackStatus = this.extractStatus(fallbackError);
          throw new AIProviderError(
            "Groq completion failed on both primary and fallback models",
            fallbackStatus ?? status,
          );
        }
      }

      throw new AIProviderError("Groq completion failed", status);
    }
  }

  private async completeWithModel(
    messages: ContextMessage[],
    model: string,
  ): Promise<string | null> {
    const chatCompletion = await this.client.chat.completions.create({
      messages,
      model,
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stop: null,
    });

    return chatCompletion.choices[0]?.message?.content ?? null;
  }

  private extractStatus(error: unknown): number | undefined {
    return typeof error === "object" && error !== null && "response" in error
      ? (error as { response?: { status?: number } }).response?.status
      : undefined;
  }

  private errorText(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }
}
