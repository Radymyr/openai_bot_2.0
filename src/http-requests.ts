import {
  addToContext,
  getContext,
  type ContextMessage,
} from "./addNewContext.js";
import { getAIProvider } from "./ai/index.js";
import { AIProviderError } from "./ai/types.js";
import { ENGLISH_CHAT_ID, WATCHED_CHAT_ID } from "./config/runtime.js";
import { bot } from "./initializers.js";
import { reportError } from "./lib/error-handler.js";
import type { TextCtx } from "./types/context.js";
import {
  deleteUserMessage,
  setPersonAi,
  type TelegramParseMode,
} from "./utils.js";

const textLimit =
  "Я курю калик и мне все равно, что ты там хочешь. Я в отпуске";

interface GetDataFromAiParams {
  userId: number | string;
  textMessage: string;
  ctx: TextCtx;
  startParams?: ContextMessage;
}

export interface AiResponse {
  text: string;
  parseMode?: TelegramParseMode;
}

export async function getDataFromAi({
  userId,
  textMessage,
  startParams,
  ctx,
}: GetDataFromAiParams): Promise<AiResponse | null> {
  if (!userId) {
    throw new Error("userId not transferred");
  }

  try {
    const message: ContextMessage = {
      role: "user",
      content: textMessage || "Message is empty",
    };

    let context = await getContext(userId);

    const isEnglishChat = String(ctx.chat.id) === String(ENGLISH_CHAT_ID);
    const personAiConfig = setPersonAi(ctx, "Markdown");
    const systemMessage: ContextMessage = {
      role: "system",
      content: personAiConfig.prompt,
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

    deleteUserMessage(ctx, ENGLISH_CHAT_ID);

    return {
      text: answer.content,
      parseMode: personAiConfig.parseMode,
    };
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
