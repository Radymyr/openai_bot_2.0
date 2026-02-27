import { safeReply } from "../utils.js";
import { isText, type AnyMessageCtx } from "../types/guards.js";
import { reportError } from "../lib/error-handler.js";
import { ensureStartContext } from "../services/start-service.js";
import { resolveStartWelcomeText } from "../services/start-content.js";

export async function handleStart(ctx: AnyMessageCtx): Promise<void> {
  if (!isText(ctx)) {
    return;
  }

  try {
    await safeReply(ctx, "👋");
    await ctx.deleteMessage();

    const welcomeText = resolveStartWelcomeText(ctx.message.text);
    const isFirstStart = await ensureStartContext(ctx.from.id, welcomeText);

    if (isFirstStart) {
      await safeReply(ctx, welcomeText);
    }
  } catch (error) {
    reportError("Failed to handle /start command", error);
    await safeReply(ctx, "Привет! Что-то пошло не так 😅");
  }
}
