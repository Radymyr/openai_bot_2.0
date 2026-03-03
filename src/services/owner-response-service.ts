import { dictionary } from "../commands.js";
import { ENABLE_ENGLISH_ECHO, ENGLISH_CHAT_ID } from "../config/runtime.js";
import { getDataFromAi } from "../http-requests.js";
import { safeReply } from "../utils.js";
import {
  isText,
  isVideoNote,
  isVoice,
  type AnyMessageCtx,
} from "../types/guards.js";
import { isReplyToBot } from "./message-context.js";

interface ConversationOptions {
  includePrivateTrigger?: boolean;
}

export async function handleOwnerConversation(
  ctx: AnyMessageCtx,
  options: ConversationOptions = {},
): Promise<void> {
  const { includePrivateTrigger = false } = options;
  const replyToBot = isReplyToBot(ctx);

  if (isVoice(ctx) && replyToBot) {
    await safeReply(ctx, "Слышите, вроде как собака скулит 🦮", {
      reply_parameters: { message_id: ctx.message.message_id },
    });
    return;
  }

  if (isVideoNote(ctx) && replyToBot) {
    await safeReply(ctx, "Ух какая милая мордашка 😏", {
      reply_parameters: { message_id: ctx.message.message_id },
    });
    return;
  }

  if (!isText(ctx) && replyToBot) {
    const firstName = ctx.from?.first_name ?? "друг";
    await safeReply(
      ctx,
      `Ха, ха ${firstName}, смешно, но больше так не делай, а то по IP вычислю`,
      { reply_parameters: { message_id: ctx.message.message_id } },
    );
    return;
  }

  if (!isText(ctx)) {
    return;
  }

  const textMessage = ctx.message.text;
  const loweredText = textMessage.toLowerCase();
  const isEnglishGroup = ctx.chat.id.toString() === String(ENGLISH_CHAT_ID);

  if (ENABLE_ENGLISH_ECHO && textMessage.split(" ").length >= 3 && isEnglishGroup) {
    await safeReply(ctx, textMessage, {
      reply_parameters: { message_id: ctx.message.message_id },
    });
    return;
  }

  const shouldAnswerWithAi =
    replyToBot ||
    dictionary.some((name) => loweredText.includes(name)) ||
    isEnglishGroup ||
    includePrivateTrigger;

  if (!shouldAnswerWithAi) {
    return;
  }

  const response = await getDataFromAi({
    userId: ctx.chat.id,
    textMessage,
    ctx,
  });

  if (!response) {
    return;
  }

  await safeReply(ctx, response.text, {
    reply_parameters: { message_id: ctx.message.message_id },
    ...(response.parseMode ? { parse_mode: response.parseMode } : {}),
  });
}
