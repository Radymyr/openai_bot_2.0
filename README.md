# openai_bot_2.0

Telegram bot на TypeScript, запускается как Vercel Serverless Function (`api/bot.ts`).

## Требования

- Node.js `>=22`
- npm `>=10`
- аккаунт Vercel
- Telegram bot token
- Groq API key
- Upstash Redis

## Переменные окружения

Создай файл `.env` в корне проекта:

```env
BOT_TOKEN=your_telegram_bot_token
GROQ_API_KEY=your_groq_api_key
UPSTASH_REDIS_URL=your_upstash_redis_url
UPSTASH_REDIS_TOKEN=your_upstash_redis_token
WEBHOOK_URL=https://your-project-name.vercel.app/api/bot
```

`WEBHOOK_URL` нужен только для локального скрипта `npm run set-webhook`.

## Переключатели И ID

Все переключатели поведения и основные chat id находятся в одном месте:

- `src/config/runtime.ts`

Основные параметры:
- `WATCHED_CHAT_ID` — чат, куда владелец пишет через бота из лички (без reply).
- `ENGLISH_CHAT_ID` — чат со специальными правилами английского режима.
- `AI_PROVIDER` — активный AI-провайдер (`groq`/`openai`).
- `ENABLE_USER_ALLOWLIST` — включить/выключить фильтр по `USERS`.
- `ENABLE_REACTIONS` — включить/выключить реакции.
- `ENABLE_OWNER_FORWARDING` — пересылка всех входящих сообщений владельцу.
- `ENABLE_OWNER_PROXY_TO_WATCHED_CHAT` — режим “владелец пишет в watched chat через личку”.
- `ENABLE_PRIVATE_TRIGGER` — приватный AI-триггер.
- `ENABLE_ENGLISH_ECHO` — эхо-режим в английском чате.

AI интеграция вынесена в отдельный слой:
- `src/ai/index.ts` — выбор провайдера
- `src/ai/providers/groq-provider.ts` — текущая реализация
- `src/ai/providers/openai-provider.ts` — шаблон для OpenAI

## Локальный запуск

1. Установи зависимости:

```bash
npm install
```

2. Проверь типы:

```bash
npm run typecheck
```

3. Запусти тесты:

```bash
npm test
```

4. Запусти локальный dev-сервер Vercel:

```bash
npm start
```

5. Проверь endpoint:

```bash
curl -i http://localhost:3000/api/bot
curl -sS -X POST http://localhost:3000/api/bot \
  -H 'content-type: application/json' \
  -d '{"update_id":1,"message":{"message_id":1,"date":1700000000,"chat":{"id":123,"type":"private"},"from":{"id":123,"is_bot":false,"first_name":"Test"},"text":"привет"}}'
```

Ожидаемо:
- `GET /api/bot` -> `405 Method Not Allowed`
- `POST /api/bot` -> `{"ok":true}`

## Деплой на Vercel

1. Авторизуйся:

```bash
vercel login
```

2. Свяжи директорию с проектом (если нужно):

```bash
vercel link
```

3. Задеплой:

```bash
npm run deploy
```

4. Проверь, что в Vercel выставлены env vars:
- `BOT_TOKEN`
- `GROQ_API_KEY`
- `UPSTASH_REDIS_URL`
- `UPSTASH_REDIS_TOKEN`

## Установка Telegram webhook

После успешного деплоя:

```bash
npm run set-webhook
```

Пример корректного webhook URL (обязательно с роутом из `api`):

```text
https://your-project-name.vercel.app/api/bot
```

Скрипт использует:
- `BOT_TOKEN`
- `WEBHOOK_URL`

## Тесты

Проект использует `vitest` для unit-тестов.

Запуск:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```
