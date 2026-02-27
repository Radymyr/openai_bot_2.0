import { ENGLISH_CHAT_ID, WATCHED_CHAT_ID } from "./config/runtime.js";

export const groups = {
  watched: {
    id: String(WATCHED_CHAT_ID),
  },
  english: {
    id: String(ENGLISH_CHAT_ID),
  },
};

export { WATCHED_CHAT_ID };
