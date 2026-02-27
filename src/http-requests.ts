import { addToContext, getContext, type ContextMessage } from "./addNewContext.js";
import { getAIProvider } from "./ai/index.js";
import { AIProviderError } from "./ai/types.js";
import { WATCHED_CHAT_ID } from "./config/runtime.js";
import { bot } from "./initializers.js";
import { reportError } from "./lib/error-handler.js";
import type { TextCtx } from "./types/context.js";
import { setPersonAi } from "./utils.js";

const textLimit =
  "Я курю калик и мне все равно, что ты там хочешь. Я в отпуске";

interface GetDataFromAiParams {
  userId: number | string;
  textMessage: string;
  ctx: TextCtx;
  startParams?: ContextMessage;
}

export async function getDataFromAi({
  userId,
  textMessage,
  startParams,
  ctx,
}: GetDataFromAiParams): Promise<string | null> {
  if (!userId) {
    throw new Error("userId not transferred");
  }

  try {
    const message: ContextMessage = {
      role: "user",
      content: textMessage || "Message is empty",
    };

    let context = await getContext(userId);

    const systemMessage: ContextMessage = {
      role: "system",
      content: setPersonAi(ctx),
    };

    if (!context.some((msg) => msg.role === "system")) {
      context = [systemMessage, ...context];
    }

    const messages: ContextMessage[] = [...context];

    if (startParams) {
      messages.push(startParams);
    }

    messages.push(message);

    const answerContent = await getAIProvider().complete(messages);

    if (!answerContent) {
      return null;
    }

    const answer: ContextMessage = {
      role: "assistant",
      content: answerContent,
    };

    await addToContext(message, userId, answer);

    return answer.content;
  } catch (error: unknown) {
    reportError("Error in getDataFromAi", error, { userId });

    const status =
      error instanceof AIProviderError
        ? error.status
        : typeof error === "object" && error !== null && "response" in error
          ? (error as { response?: { status?: number } }).response?.status
          : undefined;

    if (status === 429) {
      await bot.telegram.sendMessage(WATCHED_CHAT_ID, textLimit);
    }

    throw error;
  }
}
