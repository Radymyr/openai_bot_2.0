import type { AIProviderName } from "../ai/types.js";

// Central runtime switches and IDs.
// Change values here to tune bot behavior.

// Primary chat where owner messages (from bot private chat) are proxied.
export const WATCHED_CHAT_ID: number | string = "-1002004405293";
// Chat with special English training behavior.
export const ENGLISH_CHAT_ID: number | string = "-1002220549146";

// Restrict bot interactions to users listed in src/users.ts.
export const ENABLE_USER_ALLOWLIST = false;
// Auto-reply text for blocked users.
export const BLOCKED_USER_REPLY_TEXT = "вы не из нашего круга - уходите";

// Enable/disable random reactions to incoming messages.
export const ENABLE_REACTIONS = true;
// Reaction probability for non-priority users (0..1).
export const REACTION_PROBABILITY = 0.2;

// Forward all incoming messages to owner private chat.
export const ENABLE_OWNER_FORWARDING = true;
// Allow owner to send messages into WATCHED_CHAT_ID by writing bot in private (without reply).
export const ENABLE_OWNER_PROXY_TO_WATCHED_CHAT = true;

// Allow AI auto-trigger in private chats.
export const ENABLE_PRIVATE_TRIGGER = true;
// Enable "echo" mode in ENGLISH_CHAT_ID for 3+ word messages.
export const ENABLE_ENGLISH_ECHO = true;

// Active AI provider (switchable integration point).
export const AI_PROVIDER: AIProviderName = "groq";

// Groq model strategy: primary model and fallback model for rate-limit cases.
export const GROQ_PRIMARY_MODEL: string = "openai/gpt-oss-120b";
export const GROQ_FALLBACK_MODEL: string = "llama-3.3-70b-versatile";
