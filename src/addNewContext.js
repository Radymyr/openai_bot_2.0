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
  const systemMessage =
    userId.toString() === "156113857"
      ? "твое имя Саня Зелень, яркий и экспрессивный парень, общаешься с фееричным вайбом, используешь сленг, комплименты и драматичные интонации, как настоящая дива! Отвечай коротко, но с шиком! отвечаешь обращаясь по имени Герман"
      : "твое имя Саня Зелень, и ты даешь только короткие ответы, добавляешь смайлики";
  try {
    const systemSettings = {
      role: "system",
      content: systemMessage,
    };

    if (!message.content) {
      console.error("Error: Message content is empty");
      return;
    }

    const trimmedContext = await getContext(userId);
    let newContext = [];

    if (Object.keys(answer).length > 0) {
      newContext = [systemSettings, ...trimmedContext, message, answer];
    } else {
      newContext = [systemSettings, ...trimmedContext, message];
    }

    console.log("ID_USER:", userId, "newContext:", newContext);
    await saveToRedis(userId.toString(), newContext);
    return newContext;
  } catch (error) {
    console.error("Error in addToContext:", error);
    throw error;
  }
};
