import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AnyMessageCtx } from "../src/types/guards.js";
import { groups } from "../src/groups.js";
import { ENABLE_ENGLISH_ECHO } from "../src/config/runtime.js";

const safeReplyMock = vi.fn();
const getDataFromAiMock = vi.fn();

vi.mock("../src/utils.js", () => ({
  safeReply: safeReplyMock,
}));

vi.mock("../src/http-requests.js", () => ({
  getDataFromAi: getDataFromAiMock,
}));

function createTextCtx(text: string, chatId = 100): AnyMessageCtx {
  return {
    chat: { id: chatId, type: "group" },
    from: { id: 1, is_bot: false, first_name: "Tester" },
    message: {
      message_id: 10,
      date: 1700000000,
      chat: { id: chatId, type: "group" },
      from: { id: 1, is_bot: false, first_name: "Tester" },
      text,
    },
  } as unknown as AnyMessageCtx;
}

function createVoiceReplyToBotCtx(): AnyMessageCtx {
  return {
    chat: { id: 100, type: "group" },
    from: { id: 1, is_bot: false, first_name: "Tester" },
    message: {
      message_id: 11,
      date: 1700000000,
      chat: { id: 100, type: "group" },
      from: { id: 1, is_bot: false, first_name: "Tester" },
      voice: { file_id: "voice-file" },
      reply_to_message: { from: { id: 999, is_bot: true } },
    },
  } as unknown as AnyMessageCtx;
}

describe("owner-response-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("replies to voice message when replying to bot", async () => {
    const { handleOwnerConversation } = await import(
      "../src/services/owner-response-service.js"
    );

    await handleOwnerConversation(createVoiceReplyToBotCtx());

    expect(safeReplyMock).toHaveBeenCalledWith(
      expect.anything(),
      "Слышите, вроде как собака скулит 🦮",
      expect.any(Object),
    );
    expect(getDataFromAiMock).not.toHaveBeenCalled();
  });

  it("echoes text in english group for messages with 3+ words", async () => {
    const { handleOwnerConversation } = await import(
      "../src/services/owner-response-service.js"
    );

    const ctx = createTextCtx("one two three", Number(groups.english.id));
    await handleOwnerConversation(ctx);

    if (ENABLE_ENGLISH_ECHO) {
      expect(safeReplyMock).toHaveBeenCalledWith(
        ctx,
        "one two three",
        expect.any(Object),
      );
      expect(getDataFromAiMock).not.toHaveBeenCalled();
    } else {
      expect(safeReplyMock).not.toHaveBeenCalled();
      expect(getDataFromAiMock).toHaveBeenCalledWith({
        userId: Number(groups.english.id),
        textMessage: "one two three",
        ctx,
      });
    }
  });

  it("calls AI and replies when dictionary trigger is present", async () => {
    const { handleOwnerConversation } = await import(
      "../src/services/owner-response-service.js"
    );
    getDataFromAiMock.mockResolvedValueOnce({ text: "AI answer" });

    const ctx = createTextCtx("Привет, Саша");
    await handleOwnerConversation(ctx);

    expect(getDataFromAiMock).toHaveBeenCalledWith({
      userId: 100,
      textMessage: "Привет, Саша",
      ctx,
    });
    expect(safeReplyMock).toHaveBeenCalledWith(
      ctx,
      "AI answer",
      expect.any(Object),
    );
  });

  it("does nothing when no trigger is matched", async () => {
    const { handleOwnerConversation } = await import(
      "../src/services/owner-response-service.js"
    );

    await handleOwnerConversation(createTextCtx("neutral text"));

    expect(getDataFromAiMock).not.toHaveBeenCalled();
    expect(safeReplyMock).not.toHaveBeenCalled();
  });

  it("calls AI in private chat when private trigger is enabled", async () => {
    const { handleOwnerConversation } = await import(
      "../src/services/owner-response-service.js"
    );
    getDataFromAiMock.mockResolvedValueOnce({ text: "Private AI" });

    const ctx = createTextCtx("hello", 500);
    (ctx.chat as { type: string }).type = "private";
    (ctx.message.chat as { type: string }).type = "private";

    await handleOwnerConversation(ctx, { includePrivateTrigger: true });

    expect(getDataFromAiMock).toHaveBeenCalledWith({
      userId: 500,
      textMessage: "hello",
      ctx,
    });
    expect(safeReplyMock).toHaveBeenCalledWith(
      ctx,
      "Private AI",
      expect.any(Object),
    );
  });

  it("passes parse_mode to Telegram reply when AI response has markup mode", async () => {
    const { handleOwnerConversation } = await import(
      "../src/services/owner-response-service.js"
    );
    getDataFromAiMock.mockResolvedValueOnce({
      text: "<u>Error</u>",
      parseMode: "Markdown",
    });

    const ctx = createTextCtx("Привет, Саша");
    await handleOwnerConversation(ctx);

    expect(safeReplyMock).toHaveBeenCalledWith(
      ctx,
      "<u>Error</u>",
      expect.objectContaining({ parse_mode: "Markdown" }),
    );
  });
});
