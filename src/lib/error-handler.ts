import { logger } from "./logger.js";

export function errorToMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export function reportError(
  scope: string,
  error: unknown,
  meta: Record<string, unknown> = {},
): string {
  const message = errorToMessage(error);
  logger.error(`${scope}: ${message}`, meta);
  return message;
}
