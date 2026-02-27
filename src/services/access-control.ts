import type { AnyMessageCtx } from "../types/guards.js";
import { USERS } from "../users.js";
import {
  BLOCKED_USER_REPLY_TEXT,
  ENABLE_USER_ALLOWLIST,
} from "../config/runtime.js";

export { BLOCKED_USER_REPLY_TEXT };

export function shouldBlockByAllowlist(
  ctx: AnyMessageCtx,
  isOwnerMessage: boolean,
): boolean {
  if (!ENABLE_USER_ALLOWLIST || isOwnerMessage) {
    return false;
  }

  const senderId = ctx.message?.from?.id;
  if (typeof senderId !== "number") {
    return true;
  }

  return !USERS.some((user) => user.id === senderId);
}
