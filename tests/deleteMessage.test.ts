import { describe, expect, test, vi } from "vitest";
import { deleteUserMessage } from "../src/utils.js";

describe("deleteUserMessage", () => {
  test("calls deleteMessage when chat id matches", () => {
    const deleteMessage = vi.fn();

    const ctx = {
      chat: { id: 123 },
      message: { message_id: 999 },
      deleteMessage,
    };

    deleteUserMessage(ctx, 999);

    expect(deleteMessage).toHaveBeenCalledWith(999);
  });
});
