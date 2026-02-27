import { Groq } from "groq-sdk";
import type { TextCtx } from "./types/context.js";
import {
  addToContext,
  getContext,
  type ContextMessage,
} from "./addNewContext.js";
import { bot } from "./initializers.js";
import { currentGroupId } from "./groups.js";
import { setPersonAi } from "./utils.js";
import { reportError } from "./lib/error-handler.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile",
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stop: null,
    });

    const answerContent = chatCompletion.choices[0]?.message?.content;

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
      typeof error === "object" && error !== null && "response" in error
        ? (error as { response?: { status?: number } }).response?.status
        : undefined;

    if (status === 429) {
      await bot.telegram.sendMessage(currentGroupId, textLimit);
    }

    throw error;
  }
}
