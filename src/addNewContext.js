import { client } from "./initializers.js";

const saveToRedis = async (key, data) => {
  try {
    await client.set(key, JSON.stringify(data));
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
  const CONTEXT_LENGTH = -3;
  return context.slice(CONTEXT_LENGTH);
};

export const getContext = async (userId) => {
  const stringUserId = userId.toString();

  const context = await getFromRedis(stringUserId);
  console.log("context in get Context:", context);

  const filteredContext = context.filter((item) => item.role !== "system");
  return await trimContext(filteredContext);
};

export const addToContext = async (message, userId, answer = {}) => {
  if (!message.content) {
    console.error("Error: Message content is empty");
    return;
  }
  const systemMessage =
    "твое имя Саня фамилия Зелень, ты разговариваешь слегка хамовито, отвечаешь кратко!";

  try {
    const systemSettings = {
      role: "system",
      content: systemMessage,
    };

    const context = await getContext(userId);
    let newContext = [];

    if (Object.keys(answer).length > 0) {
      newContext = [systemSettings, ...context, message, answer];
    } else {
      newContext = [systemSettings, ...context, message];
    }

    console.log("ID_USER:", userId, "newContext:", newContext);

    await saveToRedis(userId.toString(), newContext);

    return newContext;
  } catch (error) {
    console.error("Error in addToContext:", error);
    throw error;
  }
};
