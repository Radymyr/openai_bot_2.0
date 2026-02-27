import type { AnyMessageCtx } from "../types/guards.js";

export function isBotOwnerMessage(
  ctx: AnyMessageCtx,
  botOwnerId: string,
): boolean {
  const senderId = ctx.message?.from?.id;
  if (typeof senderId !== "number") {
    return false;
  }

  return (
    senderId === Number(botOwnerId) &&
    ctx.chat.id === Number(botOwnerId)
  );
}

export function isReplyToHuman(ctx: AnyMessageCtx): boolean {
  return (
    "reply_to_message" in ctx.message &&
    Boolean(ctx.message.reply_to_message?.from) &&
    !ctx.message.reply_to_message?.from?.is_bot
  );
}

export function isReplyToBot(ctx: AnyMessageCtx): boolean {
  return (
    "reply_to_message" in ctx.message &&
    Boolean(ctx.message.reply_to_message?.from?.is_bot)
  );
}

export function buildOwnerCaption(ctx: AnyMessageCtx): string {
  const sender = ctx.message.from;
  const senderFullName = [sender.first_name, sender.last_name]
    .filter(Boolean)
    .join(" ");
  const senderUsername = sender.username ? `@${sender.username}` : "no_username";
  const chatType = ctx.chat.type;
  const chatLabel = chatType;
  const chatTitle =
    "title" in ctx.chat && ctx.chat.title
      ? ctx.chat.title
      : chatType === "private"
        ? [ctx.from?.first_name, ctx.from?.last_name].filter(Boolean).join(" ")
        : "no_title";

  return [
    `chat ID: ${ctx.chat.id}`,
    `chat type: ${chatLabel}`,
    `chat title: ${chatTitle || "no_title"}`,
    `sender: ${senderFullName || "unknown"}`,
    `sender username: ${senderUsername}`,
    `sender ID: ${sender.id}`,
    `message ID: ${ctx.message.message_id}`,
  ].join(" | ");
}

export function extractTargetChatIdFromOwnerReply(
  ctx: AnyMessageCtx,
): number | null {
  if (!("reply_to_message" in ctx.message) || !ctx.message.reply_to_message) {
    return null;
  }

  const repliedMessage = ctx.message.reply_to_message as {
    text?: string;
    caption?: string;
  };

  const source = repliedMessage.text ?? repliedMessage.caption ?? "";
  const match = source.match(/chat ID:\s*(-?\d+)/i);

  if (!match) {
    return null;
  }

  const parsed = Number(match[1]);
  return Number.isNaN(parsed) ? null : parsed;
}
