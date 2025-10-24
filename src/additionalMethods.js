import { bot } from "./initializers.js";
import { Context } from "telegraf";

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

    console.log(
      "userID:",
      ctx.message.from.id,
      "user name:",
      ctx.from.first_name,
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function exitTheChat(ctx) {
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

export async function handleStartParams(ctx) {
  // if (!ctx.message.new_chat_member) {
  //   return;
  // }

  const payload = ctx.message?.text.split(" ")[1];

  await ctx.reply(payload);
}

const someObject = {
  update_id: 520675996,
  message: {
    message_id: 5499,
    from: {
      id: 7868370890,
      is_bot: false,
      first_name: "Whisky",
      username: "Whisky_0_o",
      language_code: "en",
    },
    chat: {
      id: 7868370890,
      first_name: "Whisky",
      username: "Whisky_0_o",
      type: "private",
    },
    date: 1761301301,
    text: "/start hello",
    entities: [[Object]],
  },
};
