import { botOwnerId } from "../initializers.js";
import { handleReaction } from "../handleReaction.js";
import { safeReply } from "../utils.js";
import type { AnyMessageCtx } from "../types/guards.js";
import { reportError } from "../lib/error-handler.js";
import {
  buildOwnerCaption,
  isBotOwnerMessage,
  isReplyToHuman,
} from "../services/message-context.js";
import {
  forwardOwnerReplyToGroup,
  forwardUserMessageToOwner,
} from "../services/forwarding-service.js";
import { handleOwnerConversation } from "../services/owner-response-service.js";

export async function handleMessage(ctx: AnyMessageCtx): Promise<void> {
  await handleReaction(ctx);

  const isOwnerMessage = isBotOwnerMessage(ctx, botOwnerId);

  if (isOwnerMessage && isReplyToHuman(ctx)) {
    try {
      await forwardOwnerReplyToGroup(ctx);
      return;
    } catch (error: unknown) {
      const message = reportError("Failed to forward owner reply", error);
      await safeReply(ctx, message);
      return;
    }
  }

  if (!isOwnerMessage) {
    await forwardUserMessageToOwner(ctx, { caption: buildOwnerCaption(ctx) });
    return;
  }

  try {
    await handleOwnerConversation(ctx);
  } catch (error) {
    await safeReply(
      ctx,
      `Прости ${ctx.from.first_name}, я не знаю как это понимать, напиши текстом ;)`,
      { reply_parameters: { message_id: ctx.message.message_id } },
    );
    reportError("Failed to handle owner conversation", error);
  }
}
