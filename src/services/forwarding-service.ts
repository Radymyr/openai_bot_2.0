import { bot, botOwnerId } from "../initializers.js";
import { currentGroupId } from "../groups.js";
import {
  safeSendAnimation,
  safeSendMessage,
  safeSendPhoto,
  safeSendVideoNote,
  safeSendVoice,
} from "../utils.js";
import {
  isAnimation,
  isPhoto,
  isText,
  isVideoNote,
  isVoice,
  type AnyMessageCtx,
} from "../types/guards.js";

interface ForwardFromUserOptions {
  caption: string;
}

export async function forwardOwnerReplyToGroup(
  ctx: AnyMessageCtx,
): Promise<boolean> {
  if (isPhoto(ctx)) {
    const photoId = ctx.message.photo[0]?.file_id;
    if (photoId) {
      await bot.telegram.sendPhoto(currentGroupId, photoId);
    }
    return true;
  }

  if (isAnimation(ctx)) {
    await bot.telegram.sendAnimation(currentGroupId, ctx.message.animation.file_id);
    return true;
  }

  if (isVoice(ctx)) {
    await bot.telegram.sendVoice(currentGroupId, ctx.message.voice.file_id);
    return true;
  }

  if (isVideoNote(ctx)) {
    await bot.telegram.sendVideoNote(currentGroupId, ctx.message.video_note.file_id);
    return true;
  }

  if (isText(ctx)) {
    await safeSendMessage(currentGroupId, ctx.message.text);
    return true;
  }

  return true;
}

export async function forwardUserMessageToOwner(
  ctx: AnyMessageCtx,
  options: ForwardFromUserOptions,
): Promise<boolean> {
  const { caption } = options;

  if (isPhoto(ctx)) {
    const photoId = ctx.message.photo[0]?.file_id;
    if (photoId) {
      await safeSendPhoto(botOwnerId, photoId, { caption });
    }
    return true;
  }

  if (isAnimation(ctx)) {
    await safeSendAnimation(botOwnerId, ctx.message.animation.file_id, { caption });
    return true;
  }

  if (isVoice(ctx)) {
    await safeSendVoice(botOwnerId, ctx.message.voice.file_id, { caption });
    return true;
  }

  if (isVideoNote(ctx)) {
    await safeSendVideoNote(botOwnerId, ctx.message.video_note.file_id);
    return true;
  }

  if (isText(ctx)) {
    await safeSendMessage(botOwnerId, `${caption}: ${ctx.message.text}`);
    return true;
  }

  await safeSendMessage(botOwnerId, `${caption}: non-textual content!`);
  return true;
}
