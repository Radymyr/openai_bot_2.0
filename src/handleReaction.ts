import { bot } from "./initializers.js";
import { reactions } from "./constans/reactions.js";
import { USERS } from "./users.js";
import type { AnyMessageCtx } from "./types/guards.js";
import { reportError } from "./lib/error-handler.js";

export const handleReaction = async (ctx: AnyMessageCtx): Promise<void> => {
  if (Math.random() > 0.2 && USERS[2]?.id !== ctx.message.from.id) {
    return;
  }

  const chatId = ctx.message.chat.id;
  const messageId = ctx.message.message_id;

  const randomReaction =
    reactions[Math.floor(Math.random() * reactions.length)];

  try {
    await bot.telegram.setMessageReaction(chatId, messageId, [
      { type: "emoji", emoji: randomReaction },
    ]);
  } catch (err) {
    reportError("Failed to set message reaction", err, { chatId, messageId });
  }
};
