import type { AnyMessageCtx } from "../types/guards.js";

export function isBotOwnerMessage(
  ctx: AnyMessageCtx,
  botOwnerId: string,
): boolean {
  return (
    ctx.message.from.id === Number(botOwnerId) &&
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
  return `chat ID: ${ctx.chat.id} (${ctx.from?.first_name} ID:${ctx.message.from.id}) Message Id: ${ctx.message.message_id}`;
}
