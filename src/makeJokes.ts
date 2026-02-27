import { jokes } from "./jokes.js";
import { USERS } from "./users.js";
import type { AnyMessageCtx } from "./types/guards.js";
import { safeReply } from "./utils.js";

export const makeJokes = async (ctx: AnyMessageCtx): Promise<void> => {
  const user = USERS.find(({ name }) => name.includes("Герман"));

  if (!user || ctx.message.from.id !== user.id || Math.random() > 0.05) {
    return;
  }

  const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];

  await safeReply(ctx, randomJoke, {
    reply_parameters: { message_id: ctx.message.message_id },
  });
};
