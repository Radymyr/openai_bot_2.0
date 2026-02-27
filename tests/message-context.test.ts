import { describe, expect, it } from "vitest";
import type { AnyMessageCtx } from "../src/types/guards.js";
import {
  buildOwnerCaption,
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
    expect(buildOwnerCaption(ctx)).toContain("Message Id: 42");
  });
});
