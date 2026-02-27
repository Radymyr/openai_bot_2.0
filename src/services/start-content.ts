import { usersTexts, type UserText } from "../constans/texts.js";

const DEFAULT_WELCOME_TEXT = "Привет, давно не общались, как ты?";

export function resolveStartWelcomeText(messageText: string): string {
  const payload = messageText.split(" ")[1]?.trim();

  return (
    (payload && usersTexts[payload as keyof UserText]?.welcome) ||
    DEFAULT_WELCOME_TEXT
  );
}
