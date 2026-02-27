import { Redis } from "@upstash/redis";
import { Telegraf } from "telegraf";
import type { BotContext } from "./types/context.js";

const botToken = process.env.BOT_TOKEN;

if (!botToken) {
  throw new Error("BOT_TOKEN is missing");
}

export const bot = new Telegraf<BotContext>(botToken);

export const botOwnerId = "275210708";

export const client = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});
