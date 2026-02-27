import { addToContext } from "../addNewContext.js";
import { client } from "../initializers.js";

const STARTED_TTL_SECONDS = 60 * 60 * 24 * 30;

export async function ensureStartContext(
  userId: number,
  welcomeText: string,
): Promise<boolean> {
  const hasStartedKey = `hasStarted:${userId}`;
  const hasStarted = await client.get(hasStartedKey);

  if (hasStarted) {
    return false;
  }

  await addToContext({ role: "assistant", content: welcomeText }, userId);
  await client.set(hasStartedKey, "true", { ex: STARTED_TTL_SECONDS });

  return true;
}
