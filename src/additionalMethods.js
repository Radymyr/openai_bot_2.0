import { bot } from "./initializers.js";
import { groups } from "./groups.js";

export async function safeReply(ctx, text, extra = {}) {
  try {
    await ctx.reply(text, { ...extra });
  } catch (err) {
    if (err.description?.includes("message to be replied not found")) {
      await ctx.reply(text);
    } else {
      console.error("Reply error:", err);
    }
  }
}

export async function banChatMember(ctx, sec = 60) {
  try {
    const chatId = ctx.chat.id;
    const userId = ctx.message.from.id;
    const until = Math.floor(Date.now() / 1000) + sec;

    await bot.telegram.restrictChatMember(chatId, userId, {
      permissions: {
        can_send_messages: false,
        can_send_media_messages: false,
        can_send_other_messages: false,
        can_add_web_page_previews: false,
      },
      until_date: until,
    });

    await ctx.reply(`user: ${ctx.message.from.id} is banned`);
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function exitTheChat(ctx) {
  if (ctx.message?.from?.is_bot) {
    return;
  }

  if (ctx.chat.type === "private") {
    return;
  }

  if (ctx.message.new_chat_member) {
    return;
  }

  if (ctx.message.from.is_bot) {
    return;
  }

  const messageAge = Math.floor(Date.now() / 1000) - ctx.message.date;

  if (messageAge > 10) {
    return;
  }

  const chatId = ctx.chat?.id;

  if (!chatId) {
    return;
  }

  try {
    await ctx.reply(
      "Someone's writing something again 🤦‍♂️ That's it, I'm on vacation. Bye 👋",
      { reply_to_message_id: ctx.message?.message_id },
    );
    await bot.telegram.leaveChat(ctx.chat?.id);
  } catch (error) {
    console.error(error);
  }
}

export function setPersonAi(ctx) {
  switch (ctx.chat?.id) {
    case groups.english.id:
      return "Ты преподаватель английского языка, когда ты получаешь слово на английском, ты возвращаешь простое котроткое предложение с этим словаом";

    default:
      return "ты Девушка 25 лет, твое имя Саша фамилия Зелень, ты разговариваешь слегка хамовито, отвечаешь кратко! иногда шутишь пошло и двусмысленно";
  }
}
