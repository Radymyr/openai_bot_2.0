import { addToContext, getContext } from "./addNewContext.js";
import { Groq } from "groq-sdk";
import { bot, groupsId } from "./initializers.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const textLimit =
  "Я курю калик и мне все равно, что ты там хочешь. Я в отпуске";

export async function getDataFromOpenAi(userId, textMessage, startParams = {}) {
  if (!userId) {
    throw new Error("userId not transferred");
  }

  try {
    // 1️⃣ Сообщение от пользователя
    const message = {
      role: "user",
      content: textMessage || "Message is empty",
    };

    // 2️⃣ Забираем контекст из Redis
    let context = await getContext(userId);
    if (!Array.isArray(context)) context = [];

    // 3️⃣ Гарантируем наличие system-сообщения
    const systemMessage = {
      role: "system",
      content:
        "ты Девушка 25лет, твое имя Саша фамилия Зелень, ты разговариваешь слегка хамовито, отвечаешь кратко!",
    };

    // если system нет в контексте — добавляем
    if (!context.some((msg) => msg.role === "system")) {
      context = [systemMessage, ...context];
    }

    // 4️⃣ Формируем полный массив сообщений
    const messages = [...context];

    if (Object.values(startParams).length > 0) {
      messages.push(startParams);
    }

    messages.push(message);

    // 5️⃣ Лог для отладки (удали потом)
    console.log("---messages >>>", JSON.stringify(messages, null, 2));

    // 6️⃣ Запрос к модели Groq
    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile",
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stop: null,
    });

    const answer = chatCompletion.choices[0].message;

    // 7️⃣ Сохраняем в контекст
    await addToContext(message, userId, answer);

    // 8️⃣ Возвращаем ответ
    return answer.content;
  } catch (error) {
    console.error(
      `Error in getDataFromOpenAi for user ${userId}:`,
      error.message || error,
    );

    // 9️⃣ Обработка лимитов API
    if (error?.response?.status === 429) {
      await bot.telegram.sendMessage(groupsId[1].groupId, textLimit);
    }

    throw error;
  }
}
