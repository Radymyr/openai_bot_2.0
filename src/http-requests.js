import { addToContext, getContext } from "./addNewContext.js";
import Groq from "groq-sdk";
import { bot, groupsId } from "./initializers.js";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const textLimit =
  "Я курю калик и мне все равно, что ты там хочешь. Я в отпуске";

export async function getDataFromOpenAi(
  userId,
  message = { role: "user", content: "Message content is empty" },
) {
  try {
    if (
      !message.content ||
      typeof message.content !== "string" ||
      message.content.trim() === ""
    ) {
      throw new Error("Message content is empty or invalid");
    }

    const userMessage = { role: "user", content: message.content };

    let context = await getContext(userId);

    const messages = [...context, userMessage];

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stop: null,
    });

    console.log(messages);

    const answer = chatCompletion.choices[0].message;
    console.log("answer:", answer);

    await addToContext(message, userId, answer);

    return answer.content;
  } catch (error) {
    console.error(
      `Error in getDataFromOpenAi for user ${userId}:`,
      error.message || error,
    );
    if (error?.response.status === 429) {
      await bot.telegram.sendMessage(groupsId[1].groupId, textLimit);
    }
    throw error;
  }
}
