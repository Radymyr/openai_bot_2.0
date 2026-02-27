import { client } from "./initializers.js";
import { reportError } from "./lib/error-handler.js";

export type ContextRole = "system" | "user" | "assistant";

export interface ContextMessage {
  role: ContextRole;
  content: string;
}

const CONTEXT_TTL_SECONDS = 60 * 60 * 24 * 30;
const CONTEXT_LIMIT = 7;

const saveToRedis = async (key: string, data: ContextMessage[]): Promise<void> => {
  try {
    await client.set(key, data, { ex: CONTEXT_TTL_SECONDS });
  } catch (error: unknown) {
    reportError("Error saving context to Redis", error, { key });
  }
};

const getFromRedis = async (key: string): Promise<ContextMessage[]> => {
  try {
    const data = await client.get<ContextMessage[]>(key);
    return Array.isArray(data) ? data : [];
  } catch (error: unknown) {
    reportError("Error reading context from Redis", error, { key });
    return [];
  }
};

const trimContext = (context: ContextMessage[]): ContextMessage[] => {
  return context.slice(-CONTEXT_LIMIT);
};

export const getContext = async (
  userId: number | string,
): Promise<ContextMessage[]> => {
  const context = await getFromRedis(userId.toString());
  return trimContext(context);
};

export const addToContext = async (
  message: ContextMessage,
  userId: number | string,
  answer?: ContextMessage,
): Promise<ContextMessage[]> => {
  if (!message.content) {
    throw new Error("Message content is empty");
  }

  const context = await getContext(userId);
  const nextContext = answer ? [...context, message, answer] : [...context, message];

  await saveToRedis(userId.toString(), nextContext);
  return nextContext;
};
