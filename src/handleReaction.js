import { bot } from "./initializers.js";

export const handleReaction = async (ctx) => {
  const chatId = ctx.message?.chat.id;
  const messageId = ctx.message?.message_id;
  console.log(chatId, messageId, "function was run");
  try {
    await bot.telegram.setMessageReaction(chatId, messageId);
  } catch (err) {
    console.error(err);
  }
};
