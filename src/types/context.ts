import type { Context, NarrowedContext } from "telegraf";
import type { Message, Update } from "telegraf/types";

export interface BotContext extends Context {
  startPayload?: string;
}

export type AnyMessageContext = NarrowedContext<
  BotContext,
  Update.MessageUpdate<Message>
>;

export type TextCtx = NarrowedContext<
  BotContext,
  Update.MessageUpdate<Message.TextMessage>
>;

export type JoinCtx = NarrowedContext<
  BotContext,
  Update.MessageUpdate<Message.NewChatMembersMessage>
>;

export type PhotoCtx = NarrowedContext<
  BotContext,
  Update.MessageUpdate<Message.PhotoMessage>
>;

export type AnimationCtx = NarrowedContext<
  BotContext,
  Update.MessageUpdate<Message.AnimationMessage>
>;

export type VoiceCtx = NarrowedContext<
  BotContext,
  Update.MessageUpdate<Message.VoiceMessage>
>;

export type VideoNoteCtx = NarrowedContext<
  BotContext,
  Update.MessageUpdate<Message.VideoNoteMessage>
>;
