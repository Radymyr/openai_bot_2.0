import { client } from "./initializers.js";

const saveToRedis = async (key, data) => {
  try {
    await client.set(key, data, { ex: 60 * 60 * 24 * 30 });
  } catch (error) {
    console.error("Error saving to Redis:", error.message);
  }
};

const getFromRedis = async (key) => {
  try {
    const data = await client.get(key);
    if (!data) {
      return [];
    }
    return data;
  } catch (error) {
    console.error("Error getting from Redis:", error.message);
    return [];
  }
};

const trimContext = (context) => {
  const CONTEXT_LENGTH = -7;
  return context.slice(CONTEXT_LENGTH);
};

export const getContext = async (userId) => {
  const stringUserId = userId.toString();

  const context = await getFromRedis(stringUserId);

  return await trimContext(context);
};

export const addToContext = async (message, userId, answer = {}) => {
  if (!message.content) {
    console.error("Error: Message content is empty");
    return;
  }

  try {
    const context = await getContext(userId);
    let newContext = [];

    if (Object.keys(answer).length > 0) {
      newContext = [...context, message, answer];
    } else {
      newContext = [...context, message];
    }

    await saveToRedis(userId.toString(), newContext);

    return newContext;
  } catch (error) {
    console.error("Error in addToContext:", error);
    throw error;
  }
};
