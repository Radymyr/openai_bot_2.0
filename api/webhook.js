import { bot, botOwnerId, groupsId } from "../src/initializers.js";
import { dictionary } from "../src/commands.js";
import { USERS } from "../src/users.js";
import { getDataFromOpenAi } from "../src/http-requests.js";
import { makeJokes } from "../src/makeJokes.js";
import { handleReaction } from "../src/handleReaction.js";
import {
  exitTheChat,
  handleStartParams,
  safeReply,
} from "../src/additionalMethods.js";
import { usersTexts } from "../src/constans/texts.js";
import { addToContext } from "../src/addNewContext.js";

async function handleMessage(ctx) {
  const usersId = USERS.map((user) => user.id);
  const groupId = groupsId[1].groupId; // ID группы "Престарелые алкоголики"

  // Фильтрация: только разрешённые пользователи
  if (!usersId.includes(ctx.message?.from.id)) {
    await safeReply("🖕", { reply_to_message_id: ctx.message?.message_id });
    return;
  }
  const payload = await handleStartParams(ctx);
  await exitTheChat(ctx);
  await handleReaction(ctx);

  const isBotOwner =
    ctx.message?.from.id === parseInt(botOwnerId) &&
    ctx.chat.id === parseInt(botOwnerId);
  const isNotBotReply = !ctx.message?.reply_to_message?.from.is_bot;

  // Логика для владельца бота: пересылка сообщений в группу
  if (isBotOwner && isNotBotReply) {
    const photoId = ctx.message?.photo?.[0]?.file_id;
    const animationId = ctx.message?.animation?.file_id;
    const voiceId = ctx.message?.voice?.file_id;
    const videoNoteId = ctx.message?.video_note?.file_id;
    const text = ctx.message?.text;
    const messageId = ctx.message?.message_id;

    try {
      if (photoId) {
        await bot.telegram.sendPhoto(groupId, photoId);
      } else if (animationId) {
        await bot.telegram.sendAnimation(groupId, animationId);
      } else if (voiceId) {
        await bot.telegram.sendVoice(groupId, voiceId);
      } else if (videoNoteId) {
        await bot.telegram.sendVideoNote(groupId, videoNoteId);
      } else if (text) {
        await bot.telegram.sendMessage(groupId, text);
      }
      return;
    } catch (error) {
      console.log(error);
      ctx.reply(error);
      return;
    }
  }

  // Пересылка сообщений от пользователей владельцу
  const userSignature = `chat ID: ${ctx.chat.id} (${ctx.from?.first_name} ID:${ctx.message?.from.id}) Message Id: ${ctx.message.message_id}`;

  if (isNotBotReply) {
    const photoId = ctx.message?.photo?.[0]?.file_id;
    const animationId = ctx.message?.animation?.file_id;
    const voiceId = ctx.message?.voice?.file_id;
    const videoNoteId = ctx.message?.video_note?.file_id;
    const text = ctx.message?.text;

    if (photoId) {
      await bot.telegram.sendPhoto(botOwnerId, photoId, {
        caption: userSignature,
      });
    } else if (animationId) {
      await bot.telegram.sendAnimation(botOwnerId, animationId, {
        caption: userSignature,
      });
    } else if (voiceId) {
      await bot.telegram.sendVoice(botOwnerId, voiceId, {
        caption: userSignature,
      });
    } else if (videoNoteId) {
      await bot.telegram.sendVideoNote(botOwnerId, videoNoteId);
    } else if (text) {
      await bot.telegram.sendMessage(botOwnerId, `${userSignature}: ${text}`);
    } else {
      await bot.telegram.sendMessage(
        botOwnerId,
        `${userSignature}: non-textual content!`,
      );
    }
  }

  try {
    // Обработка голосовых сообщений
    if (ctx.message?.voice && ctx.message?.reply_to_message?.from.is_bot) {
      await ctx.reply(`Слышите, вроде как собака скулит 🦮`, {
        reply_to_message_id: ctx.message.message_id,
      });
      return;
    }

    // Обработка видеосообщений
    if (ctx.message?.video_note && ctx.message?.reply_to_message?.from.is_bot) {
      await ctx.reply(`Ух какая милая мордашка 😏`, {
        reply_to_message_id: ctx.message.message_id,
      });
      return;
    }

    // Обработка не-текстовых сообщений
    if (!ctx.message.text && ctx.message?.reply_to_message?.from.is_bot) {
      await ctx.reply(
        `Ха, ха ${ctx.from.first_name}, смешно, но больше так не делай, а то по IP вычислю`,
        { reply_to_message_id: ctx.message.message_id },
      );
      return;
    }

    if (!ctx.message.text) return;

    const loweredText = ctx.message.text?.toLowerCase();

    // Обработка шуток
    await makeJokes(ctx);

    const textContent = usersTexts[payload] ? usersTexts[payload].welcome : "";

    if (textContent) {
      await ctx.reply(textContent);
    }

    const startMessage = textContent
      ? {
          role: "assistant",
          content: textContent,
        }
      : null;

    if (ctx.message.text.startsWith("/start") && startMessage) {
      await addToContext(startMessage, ctx.message.from.id);
    }

    // Ответ на реплаи бота или обращение по имени
    if (
      ctx.message.reply_to_message?.from.is_bot ||
      dictionary.some((name) => loweredText?.includes(name))
    ) {
      const originalMessage = ctx.message?.message_id;

      const textMessage = ctx.message?.text;

      const response = await getDataFromOpenAi(
        ctx.message.from.id,
        textMessage,
      );

      await ctx.reply(response, { reply_to_message_id: originalMessage });
    }
  } catch (err) {
    await ctx.reply(
      `Прости бро ${ctx.from.first_name}, я не знаю как это понимать, напиши текстом ;)`,
      { reply_to_message_id: ctx.message.message_id },
    );
    console.error(err);
  }
}

// Регистрация обработчика сообщений
bot.on("message", handleMessage);

// Serverless-функция для Vercel
export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const update = req?.body;
    console.log(update);
    await bot.handleUpdate(update);
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
