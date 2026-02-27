import { describe, expect, it } from "vitest";
import type { AnyMessageCtx } from "../src/types/guards.js";
import {
  buildOwnerCaption,
  extractTargetChatIdFromOwnerReply,
  isBotOwnerMessage,
  isReplyToBot,
  isReplyToHuman,
} from "../src/services/message-context.js";

function createCtx(overrides: Record<string, unknown> = {}): AnyMessageCtx {
  return {
    chat: { id: 123, type: "private" },
    from: { id: 123, first_name: "Test", is_bot: false },
    message: {
      message_id: 42,
      from: { id: 123, is_bot: false, first_name: "Test" },
      chat: { id: 123, type: "private" },
      date: 1700000000,
      text: "hello",
      ...overrides,
    },
  } as unknown as AnyMessageCtx;
}

describe("message-context service", () => {
  it("detects owner message", () => {
    const ctx = createCtx({ from: { id: 275210708, is_bot: false, first_name: "Owner" } });
    (ctx.chat as { id: number }).id = 275210708;

    expect(isBotOwnerMessage(ctx, "275210708")).toBe(true);
    expect(isBotOwnerMessage(ctx, "1")).toBe(false);
  });

  it("does not crash when sender is missing", () => {
    const ctx = createCtx({ from: undefined });
    expect(isBotOwnerMessage(ctx, "275210708")).toBe(false);
  });

  it("detects reply target type", () => {
    const replyToHumanCtx = createCtx({
      reply_to_message: { from: { id: 500, is_bot: false } },
    });

    const replyToBotCtx = createCtx({
      reply_to_message: { from: { id: 600, is_bot: true } },
    });

    expect(isReplyToHuman(replyToHumanCtx)).toBe(true);
    expect(isReplyToBot(replyToHumanCtx)).toBe(false);
    expect(isReplyToHuman(replyToBotCtx)).toBe(false);
    expect(isReplyToBot(replyToBotCtx)).toBe(true);
  });

  it("builds owner caption", () => {
    const ctx = createCtx();
    expect(buildOwnerCaption(ctx)).toContain("chat ID: 123");
    expect(buildOwnerCaption(ctx)).toContain("message ID: 42");
    expect(buildOwnerCaption(ctx)).toContain("chat type: private");
  });

  it("extracts target chat id from relayed reply text", () => {
    const ctx = createCtx({
      reply_to_message: {
        from: { id: 999, is_bot: true },
        text: "chat ID: -1002220549146 (Alice ID:11) Message Id: 77: hello",
      },
    });

    expect(extractTargetChatIdFromOwnerReply(ctx)).toBe(-1002220549146);
  });

  it("returns null when relayed reply has no chat id marker", () => {
    const ctx = createCtx({
      reply_to_message: {
        from: { id: 999, is_bot: true },
        text: "random text",
      },
    });

    expect(extractTargetChatIdFromOwnerReply(ctx)).toBeNull();
  });

  it("extracts target chat id from relayed caption", () => {
    const ctx = createCtx({
      reply_to_message: {
        from: { id: 999, is_bot: true },
        caption: "chat ID: 859532447 | chat type: private | sender: User",
      },
    });

    expect(extractTargetChatIdFromOwnerReply(ctx)).toBe(859532447);
  });
});
