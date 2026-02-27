import type { VercelRequest, VercelResponse } from "@vercel/node";
import { bot } from "../src/initializers.js";
import { handleMessage } from "../src/handlers/message-handler.js";
import { handleStart } from "../src/handlers/start-handler.js";
import type { AnyMessageCtx } from "../src/types/guards.js";
import { reportError } from "../src/lib/error-handler.js";

bot.start(async (ctx) => {
  await handleStart(ctx as AnyMessageCtx);
});

bot.on("message", async (ctx) => {
  await handleMessage(ctx as AnyMessageCtx);
});

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await bot.handleUpdate(req.body);
    return res.status(200).json({ ok: true });
  } catch (error) {
    reportError("Webhook error", error);
    return res.status(200).json({ ok: false });
  }
};
