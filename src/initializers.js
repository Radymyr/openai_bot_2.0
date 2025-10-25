import { Telegraf } from "telegraf";
import { Redis } from "@upstash/redis";

export const bot = new Telegraf(process.env.BOT_TOKEN);

export const botOwnerId = "275210708";

export const client = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});
