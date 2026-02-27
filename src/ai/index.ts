import { AI_PROVIDER } from "../config/runtime.js";
import { OpenAIProvider } from "./providers/openai-provider.js";
import { GroqProvider } from "./providers/groq-provider.js";
import type { AIProvider } from "./types.js";

let providerInstance: AIProvider | null = null;

function createProvider(): AIProvider {
  switch (AI_PROVIDER) {
    case "groq":
      return new GroqProvider(process.env.GROQ_API_KEY);
    case "openai":
      return new OpenAIProvider();
    default:
      return new GroqProvider(process.env.GROQ_API_KEY);
  }
}

export function getAIProvider(): AIProvider {
  if (!providerInstance) {
    providerInstance = createProvider();
  }

  return providerInstance;
}
