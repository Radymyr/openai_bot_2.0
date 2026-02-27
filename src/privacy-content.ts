import type { TextCtx } from "./types/context.js";

export function getPrivacyContent(ctx: TextCtx): string | null {
  const lowerText = ctx.message.text.toLowerCase();
  const codePhrase = "покажи мне пошлости, я разрешаю";

  if (lowerText.includes(codePhrase)) {
    return "🔓 Режим приватного контента активирован";
  }

  return null;
}
