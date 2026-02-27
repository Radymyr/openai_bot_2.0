import type {
  AnimationCtx,
  AnyMessageContext,
  JoinCtx,
  PhotoCtx,
  TextCtx,
  VideoNoteCtx,
  VoiceCtx,
} from "./context.js";
import { MessageKind } from "./message-kind.js";

export type AnyMessageCtx = AnyMessageContext;

const has = (ctx: AnyMessageCtx, key: string): boolean => key in ctx.message;

export function isPhoto(ctx: AnyMessageCtx): ctx is PhotoCtx {
  return has(ctx, MessageKind.Photo);
}

export function isText(ctx: AnyMessageCtx): ctx is TextCtx {
  return has(ctx, MessageKind.Text);
}

export function isVoice(ctx: AnyMessageCtx): ctx is VoiceCtx {
  return has(ctx, MessageKind.Voice);
}

export function isAnimation(ctx: AnyMessageCtx): ctx is AnimationCtx {
  return has(ctx, MessageKind.Animation);
}

export function isVideoNote(ctx: AnyMessageCtx): ctx is VideoNoteCtx {
  return has(ctx, MessageKind.VideoNote);
}

export function isJoin(ctx: AnyMessageCtx): ctx is JoinCtx {
  return has(ctx, MessageKind.NewChatMember);
}
