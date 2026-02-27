import { reactions } from "./constans/reactions.js";
import { bot } from "./initializers.js";
import { reportError } from "./lib/error-handler.js";
import type { AnyMessageCtx } from "./types/guards.js";
import { USERS } from "./users.js";
import { ENABLE_REACTIONS, REACTION_PROBABILITY } from "./config/runtime.js";

export const handleReaction = async (ctx: AnyMessageCtx): Promise<void> => {
  if (!ENABLE_REACTIONS) {
    return;
  }

  const senderId = ctx.message?.from?.id;

  if (typeof senderId !== "number") {
    return;
  }

  if (Math.random() > REACTION_PROBABILITY && USERS[2]?.id !== senderId) {
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
