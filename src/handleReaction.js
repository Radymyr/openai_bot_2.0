import { bot } from "./initializers.js";
import { reactions } from "./constans/reactions.js";

export const handleReaction = async (ctx) => {
  if (Math.random() <= 0.5) {
    const chatId = ctx.message?.chat.id;
    const messageId = ctx.message?.message_id;

    const randomReaction =
      reactions[Math.floor(Math.random() * reactions.length)];
    try {
      await bot.telegram.setMessageReaction(chatId, messageId, [
        { type: "emoji", emoji: randomReaction },
      ]);
    } catch (err) {
      console.error(err);
    }
  }
};
