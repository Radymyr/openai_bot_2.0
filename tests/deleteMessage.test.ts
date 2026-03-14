import { describe, expect, test, vi } from "vitest";
import { deleteUserMessage } from "../src/utils.js";
import { mock } from "node:test";

vi.mock("../src/initializers.js", () => ({
  bot: {
    telegram: {
      sendMessage: vi.fn(),
      sendAnimation: vi.fn(),
      sendPhoto: vi.fn(),
      sendVoice: vi.fn(),
      sendVideoNote: vi.fn(),
    },
  },
}));

describe("deleteUserMessage", () => {
  test("calls deleteMessage when chat id matches", () => {
    const deleteMessage = vi.fn();

    const ctx = {
      chat: { id: 123 },
      message: { message_id: 999 },
      deleteMessage,
    };

    deleteUserMessage(ctx, 123);

    expect(deleteMessage).toHaveBeenCalledWith(999);
  });

  test("deleteMessage should not calls", () => {
    const deleteMessage = vi.fn();

    const ctx = {
      chat: { id: 123 },
      message: { message_id: 999 },
      deleteMessage,
    };

    deleteUserMessage(ctx, 124);

    expect(deleteMessage).not.toHaveBeenCalled();
  });

  test("should calls without error", () => {
    const ctx = { chat: undefined };

    expect(() => deleteUserMessage(ctx, 124)).not.toThrow();
  });

  test("should calls without error", () => {
    const consoleSpy = vi.spyOn(console, "log");
    const ctx = {
      chat: { id: 123 },
      message: { message_id: 999 },
      deleteMessage: vi.fn(() => {
        throw new Error("Telegram API error");
      }),
    };
    deleteUserMessage(ctx, 123);

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
