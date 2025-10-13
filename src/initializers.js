import { Telegraf } from "telegraf";
import { Redis } from "@upstash/redis";

export const bot = new Telegraf(process.env.BOT_TOKEN);
export const groupsId = [
  { name: "Test-test", groupId: "-1002004405293" },
  { name: "Престарелые алкоголики", groupId: "-1002033714336" },
  { name: "приватный чат Алума", groupId: "859532447" },
];
export const botOwnerId = "275210708";

export const client = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});
