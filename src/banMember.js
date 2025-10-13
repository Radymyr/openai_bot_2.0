import { bot } from './initializers.js';

export async function banMember(ctx, sec = 60) {

    try {
        const chatId = ctx.chat.id
        const userId = ctx.message.from.id
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
            'userID:',
            ctx.message.from.id,
            'user name:',
            ctx.from.first_name
        );
    } catch (error) {
        console.error('Error:', error);
    }
}
