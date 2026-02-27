import { botOwnerId } from "../initializers.js";
import { handleReaction } from "../handleReaction.js";
import { safeReply } from "../utils.js";
import type { AnyMessageCtx } from "../types/guards.js";
import { reportError } from "../lib/error-handler.js";
import {
  buildOwnerCaption,
  extractTargetChatIdFromOwnerReply,
  isBotOwnerMessage,
  isReplyToBot,
} from "../services/message-context.js";
import {
  BLOCKED_USER_REPLY_TEXT,
  shouldBlockByAllowlist,
} from "../services/access-control.js";
import {
  forwardOwnerReplyToChat,
  forwardUserMessageToOwner,
} from "../services/forwarding-service.js";
import { handleOwnerConversation } from "../services/owner-response-service.js";
import {
  ENABLE_OWNER_FORWARDING,
  ENABLE_OWNER_PROXY_TO_WATCHED_CHAT,
  ENABLE_PRIVATE_TRIGGER,
  WATCHED_CHAT_ID,
} from "../config/runtime.js";

export async function handleMessage(ctx: AnyMessageCtx): Promise<void> {
  await handleReaction(ctx);

  const isOwnerMessage = isBotOwnerMessage(ctx, botOwnerId);

  if (shouldBlockByAllowlist(ctx, isOwnerMessage)) {
    await forwardUserMessageToOwner(ctx, { caption: buildOwnerCaption(ctx) });
    await safeReply(ctx, BLOCKED_USER_REPLY_TEXT);
    return;
  }

  if (isOwnerMessage) {
    const targetChatId = extractTargetChatIdFromOwnerReply(ctx);
    if (targetChatId === null) {
      // Owner private message without reply: proactively send to watched chat.
      if (
        ENABLE_OWNER_PROXY_TO_WATCHED_CHAT &&
        ctx.chat.type === "private" &&
        !isReplyToBot(ctx)
      ) {
        try {
          const sent = await forwardOwnerReplyToChat(ctx, WATCHED_CHAT_ID);
          if (!sent) {
            await safeReply(
              ctx,
              "Не удалось отправить сообщение в наблюдаемый чат. Возможно, бот удален или не имеет доступа.",
            );
          }
          return;
        } catch (error: unknown) {
          const message = reportError(
            "Failed to send owner message to watched chat",
            error,
            { targetChatId: WATCHED_CHAT_ID },
          );
          await safeReply(ctx, message);
          return;
        }
      }
    } else {
      try {
        const sent = await forwardOwnerReplyToChat(ctx, targetChatId);
        if (!sent) {
          await safeReply(
            ctx,
            `Не удалось отправить сообщение в chat ID ${targetChatId}. Возможно, бот удален или заблокирован.`,
          );
        }
        return;
      } catch (error: unknown) {
        const message = reportError("Failed to forward owner reply", error, {
          targetChatId,
        });
        await safeReply(ctx, message);
        return;
      }
    }
  }

  if (!isOwnerMessage && ENABLE_OWNER_FORWARDING) {
    await forwardUserMessageToOwner(ctx, { caption: buildOwnerCaption(ctx) });
  }

  try {
    await handleOwnerConversation(ctx, {
      includePrivateTrigger:
        ENABLE_PRIVATE_TRIGGER && !isOwnerMessage && ctx.chat.type === "private",
    });
  } catch (error) {
    const firstName = ctx.from?.first_name ?? "друг";
    try {
      await safeReply(
        ctx,
        `Прости ${firstName}, я не знаю как это понимать, напиши текстом ;)`,
        { reply_parameters: { message_id: ctx.message.message_id } },
      );
    } catch {
      // ignore secondary reply errors
    }
    reportError("Failed to handle owner conversation", error);
  }
}
