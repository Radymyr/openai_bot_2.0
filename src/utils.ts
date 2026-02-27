import type { FmtString } from "telegraf/format";
import { ENGLISH_CHAT_ID } from "./config/runtime.js";
import { bot } from "./initializers.js";
import type { AnyMessageCtx } from "./types/guards.js";
import { reportError } from "./lib/error-handler.js";

type ReplyExtra = Parameters<AnyMessageCtx["reply"]>[1];
type SendMessageExtra = Parameters<typeof bot.telegram.sendMessage>[2];
type SendAnimationExtra = Parameters<typeof bot.telegram.sendAnimation>[2];
type SendPhotoExtra = Parameters<typeof bot.telegram.sendPhoto>[2];
type SendVoiceExtra = Parameters<typeof bot.telegram.sendVoice>[2];
type SendVideoNoteExtra = Parameters<typeof bot.telegram.sendVideoNote>[2];

export async function safeReply(
  ctx: AnyMessageCtx,
  text: string,
  extra: ReplyExtra = {},
): Promise<void> {
  try {
    await ctx.reply(text, { ...extra });
  } catch (error: unknown) {
    const description =
      typeof error === "object" && error !== null && "description" in error
        ? String((error as { description?: string }).description)
        : "";

    if (description.includes("message to be replied not found")) {
      await ctx.reply(text);
      return;
    }

    reportError("Reply error", error);
  }
}

export async function safeSendMessage(
  chatId: number | string,
  text: string | FmtString,
  extra: SendMessageExtra = {},
) {
  try {
    return await bot.telegram.sendMessage(chatId, text, { ...extra });
  } catch (error) {
    reportError("safeSendMessage failed", error, { chatId });
    return null;
  }
}

export async function safeSendAnimation(
  chatId: number | string,
  animation: Parameters<typeof bot.telegram.sendAnimation>[1],
  extra: SendAnimationExtra = {},
) {
  try {
    return await bot.telegram.sendAnimation(chatId, animation, { ...extra });
  } catch (error) {
    reportError("safeSendAnimation failed", error, { chatId });
    return null;
  }
}

export async function safeSendPhoto(
  chatId: number | string,
  photo: Parameters<typeof bot.telegram.sendPhoto>[1],
  extra: SendPhotoExtra = {},
) {
  try {
    return await bot.telegram.sendPhoto(chatId, photo, { ...extra });
  } catch (error) {
    reportError("safeSendPhoto failed", error, { chatId });
    return null;
  }
}

export async function safeSendVoice(
  chatId: number | string,
  voice: Parameters<typeof bot.telegram.sendVoice>[1],
  extra: SendVoiceExtra = {},
) {
  try {
    return await bot.telegram.sendVoice(chatId, voice, { ...extra });
  } catch (error) {
    reportError("safeSendVoice failed", error, { chatId });
    return null;
  }
}

export async function safeSendVideoNote(
  chatId: number | string,
  videoNote: Parameters<typeof bot.telegram.sendVideoNote>[1],
  extra: SendVideoNoteExtra = {},
) {
  try {
    return await bot.telegram.sendVideoNote(chatId, videoNote, { ...extra });
  } catch (error) {
    reportError("safeSendVideoNote failed", error, { chatId });
    return null;
  }
}

export function setPersonAi(ctx: AnyMessageCtx): string {
  const chatId = String(ctx.chat.id);

  switch (chatId) {
    case String(ENGLISH_CHAT_ID):
      return "Ты преподаватель английского языка, когда ты получаешь слово или слова на английском, ты возвращаешь простое котроткое предложение с этим словаом или словами на английском. Пердложения должны быть максимально короткими!!!";
    default:
      return "ты Девушка 25 лет, твое имя Саша фамилия Зелень, ты разговариваешь слегка хамовито, отвечаешь кратко! иногда шутишь пошло и двусмысленно";
  }
}
