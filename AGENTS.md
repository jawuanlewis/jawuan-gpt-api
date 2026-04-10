# Project Context - `jawuan-gpt-api`

REST API backend for Jawuan GPT, a personal AI-powered chatbot. Handles chat session management and OpenAI interactions for the [jawuan-gpt-client](https://github.com/jawuanlewis/jawuan-gpt-client) frontend.

## Stack

- **Runtime:** Node.js >=20, Express 5.x
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose)
- **AI:** OpenAI API — GPT-4o Mini (hardcoded)
- **ID generation:** nanoid
- **Middleware:** compression, cors
- **Formatting:** Prettier
- **Package manager:** pnpm
- **Testing:** None configured

## Architecture

```text
routes/ → controllers/ → models/
              ↓
           config/  (db, openai)
```

- `app.ts` — Express setup and entry point
- `routes/chat-routes.ts` — route definitions
- `controllers/chat-controller.ts` — all business logic
- `models/Chat.ts` — Mongoose Chat schema (embeds messages)
- `models/Message.ts` — Message sub-schema
- `types/chat.ts` — shared TypeScript interfaces (`IChat`, `IMessage`)
- `config/db.ts` — MongoDB connection
- `config/open-ai.ts` — OpenAI client initialization

## API

All endpoints require the `X-Client-ID` header to scope data to a user session.

| Method | Path                | Description                                                          |
| ------ | ------------------- | -------------------------------------------------------------------- |
| GET    | `/api/chat/history` | Retrieve all chats for client, sorted by last activity               |
| POST   | `/api/chat/prompt`  | Send prompt to GPT-4o Mini; creates new chat if no `chat.id` in body |
| PATCH  | `/api/chat/title`   | Update the title of an existing chat                                 |

HTTP status codes: 400 validation, 404 not found, 500 unexpected error, 503 OpenAI failure.

## MongoDB Collections

Single collection: **chats**

- `id` (string, unique, nanoid) — unique chat identifier
- `userId` (string) — value of the `X-Client-ID` header
- `title` (string) — auto-generated as `"Chat ${Date.now()}"` on creation
- `messages` (embedded array) — `{ id, role: 'user'|'assistant', content }` (no `_id`)
- `createdAt`, `updatedAt` — Mongoose timestamps

## Conventions

- **Files:** kebab-case for all non-model files (e.g. `chat-controller.ts`, `chat-routes.ts`, `open-ai.ts`); PascalCase for model files to mirror the exported class name (e.g. `Chat.ts`, `Message.ts`)
- **Folders:** kebab-case
- **Functions/variables:** camelCase
- **Env var constants:** UPPER_SNAKE_CASE
- **Interfaces:** PascalCase with `I` prefix (`IChat`, `IMessage`)
- **Mongoose models:** PascalCase (`Chat`, `Message`)
- **IDs:** generated with `nanoid()` (not UUID)

## Dev Commands

```bash
pnpm dev        # TypeScript watch + nodemon (development)
pnpm build      # tsc — compile to dist/
pnpm start      # node dist/app.js (production)
pnpm lint       # check formatting
pnpm format     # fix formatting
```

## Environment Variables

| Variable         | Required | Description                             |
| ---------------- | -------- | --------------------------------------- |
| `MONGO_URI`      | Yes      | MongoDB connection string               |
| `OPENAI_API_KEY` | Yes      | OpenAI API key — app crashes without it |
| `PORT`           | No       | Server port (default: 3000)             |
| `CUSTOM_URL`     | No       | Extra CORS origin                       |
| `PREVIEW_URL`    | No       | Preview/staging CORS origin             |
| `PROD_URL`       | No       | Production CORS origin                  |

## Gotchas

- **No auth library** — `X-Client-ID` is a plain string header, not a signed/verified token. This is intentional for personal use; do not add JWT or session-based auth without revisiting the whole data ownership model
- **Chat reassignment** — if a prompt references a chat whose `userId` doesn't match the incoming `X-Client-ID`, the controller reassigns ownership to the new client; this is by design for session migration
- **TypeScript casting in routes** — controllers are cast `as unknown as RequestHandler` due to a type mismatch with Express 5 + async handlers; this is a known workaround, not a bug
- **No request validation library** — inputs are checked with manual `typeof` guards; there is no Zod/Joi schema layer
- **GPT model is hardcoded** — `'gpt-4o-mini'` is set directly in `controllers/chat-controller.ts`; no env var or config knob
- **Express 5** — async errors propagate natively; do not add `express-async-errors`
- **No tests** — no testing framework is set up; contributions should aim to add one before expanding the API surface
