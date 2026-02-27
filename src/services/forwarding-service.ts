import { botOwnerId } from "../initializers.js";
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

export async function forwardOwnerReplyToChat(
  ctx: AnyMessageCtx,
  chatId: number | string,
): Promise<boolean> {
  if (isPhoto(ctx)) {
    const photoId = ctx.message.photo[0]?.file_id;
    if (photoId) {
      const sent = await safeSendPhoto(chatId, photoId);
      return Boolean(sent);
    }
    return false;
  }

  if (isAnimation(ctx)) {
    const animationId = ctx.message.animation?.file_id;
    if (!animationId) {
      return false;
    }
    const sent = await safeSendAnimation(chatId, animationId);
    return Boolean(sent);
  }

  if (isVoice(ctx)) {
    const voiceId = ctx.message.voice?.file_id;
    if (!voiceId) {
      return false;
    }
    const sent = await safeSendVoice(chatId, voiceId);
    return Boolean(sent);
  }

  if (isVideoNote(ctx)) {
    const videoNoteId = ctx.message.video_note?.file_id;
    if (!videoNoteId) {
      return false;
    }
    const sent = await safeSendVideoNote(chatId, videoNoteId);
    return Boolean(sent);
  }

  if (isText(ctx)) {
    const sent = await safeSendMessage(chatId, ctx.message.text);
    return Boolean(sent);
  }

  return false;
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
    const animationId = ctx.message.animation?.file_id;
    if (!animationId) {
      await safeSendMessage(botOwnerId, `${caption}: animation without file_id`);
      return true;
    }
    await safeSendAnimation(botOwnerId, animationId, {
      caption,
    });
    return true;
  }

  if (isVoice(ctx)) {
    const voiceId = ctx.message.voice?.file_id;
    if (!voiceId) {
      await safeSendMessage(botOwnerId, `${caption}: voice without file_id`);
      return true;
    }
    await safeSendVoice(botOwnerId, voiceId, { caption });
    return true;
  }

  if (isVideoNote(ctx)) {
    const videoNoteId = ctx.message.video_note?.file_id;
    if (!videoNoteId) {
      await safeSendMessage(botOwnerId, `${caption}: video_note without file_id`);
      return true;
    }
    await safeSendMessage(botOwnerId, caption);
    await safeSendVideoNote(botOwnerId, videoNoteId);
    return true;
  }

  if (isText(ctx)) {
    await safeSendMessage(botOwnerId, `${caption}: ${ctx.message.text}`);
    return true;
  }

  await safeSendMessage(botOwnerId, `${caption}: non-textual content!`);
  return true;
}
