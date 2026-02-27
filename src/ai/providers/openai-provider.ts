import type { ContextMessage } from "../../addNewContext.js";
import { AIProviderError, type AIProvider } from "../types.js";

export class OpenAIProvider implements AIProvider {
  // Placeholder provider for future OpenAI integration.
  async complete(_messages: ContextMessage[]): Promise<string | null> {
    throw new AIProviderError(
      "OpenAI provider is not configured yet. Implement src/ai/providers/openai-provider.ts",
    );
  }
}
