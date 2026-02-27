import "dotenv/config";

async function setWebhook(): Promise<void> {
  const token = process.env.BOT_TOKEN;
  const webhookUrl = process.env.WEBHOOK_URL;

  if (!token) {
    throw new Error("BOT_TOKEN is missing");
  }

  if (!webhookUrl) {
    throw new Error("WEBHOOK_URL is missing");
  }

  const response = await fetch(
    `https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`,
  );

  if (!response.ok) {
    throw new Error(`Webhook setup failed: ${response.status}`);
  }

  const payload = await response.json();
  console.log(payload);
}

await setWebhook();
