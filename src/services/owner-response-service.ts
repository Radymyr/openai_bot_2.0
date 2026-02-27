import { dictionary } from "../commands.js";
import { groups } from "../groups.js";
import { getDataFromAi } from "../http-requests.js";
import { safeReply } from "../utils.js";
import {
  isText,
  isVideoNote,
  isVoice,
  type AnyMessageCtx,
} from "../types/guards.js";
import { isReplyToBot } from "./message-context.js";

export async function handleOwnerConversation(
  ctx: AnyMessageCtx,
): Promise<void> {
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
    await safeReply(
      ctx,
      `Ха, ха ${ctx.from.first_name}, смешно, но больше так не делай, а то по IP вычислю`,
      { reply_parameters: { message_id: ctx.message.message_id } },
    );
    return;
  }

  if (!isText(ctx)) {
    return;
  }

  const textMessage = ctx.message.text;
  const loweredText = textMessage.toLowerCase();
  const isEnglishGroup = ctx.chat.id.toString() === groups.english.id;

  if (textMessage.split(" ").length >= 3 && isEnglishGroup) {
    await safeReply(ctx, textMessage, {
      reply_parameters: { message_id: ctx.message.message_id },
    });
    return;
  }

  const shouldAnswerWithAi =
    replyToBot ||
    dictionary.some((name) => loweredText.includes(name)) ||
    isEnglishGroup;

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

  await safeReply(ctx, response, {
    reply_parameters: { message_id: ctx.message.message_id },
  });
}
