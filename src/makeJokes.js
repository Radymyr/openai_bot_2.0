import {USERS} from "./users.js";
import {jokes} from "./jokes.js";

export const makeJokes = (ctx) => {
    const user = USERS.find(({name}) => name.includes('Герман'));

    if (!user) {
        return;
    }

    const fromId = ctx.message.from.id;

    if (fromId === user.id) {
        const chance = Math.random();
        if (chance <= 0.05) {
            const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
            ctx.reply(randomJoke, {
                reply_to_message_id: ctx.message.message_id,
            });
        }
    }
}