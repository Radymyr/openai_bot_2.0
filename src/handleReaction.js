import { bot } from "./initializers.js";

export const handleReaction = async (ctx) => {
  const chatId = ctx.message?.chat.id;
  const messageId = ctx.message?.message_id;
  try {
    await bot.telegram.setMessageReaction(chatId, messageId, [
      { type: "emoji", emoji: "❤‍🔥" },
    ]);
  } catch (err) {
    console.error(err);
  }
};
