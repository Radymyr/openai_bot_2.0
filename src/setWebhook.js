import "dotenv/config";

const WEBHOOK_URL = "openai-bot-2-0-41kz.vercel.app/api/webhook";

async function setWebhook() {
  const resp = await fetch(
    `https://api.telegram.org/bot${process.env.BOT_TOKEN}/setWebhook?url=${WEBHOOK_URL}`,
  );
  console.log(resp);
}

await setWebhook();
