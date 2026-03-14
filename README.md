# Jawuan's GPT API

## 📚 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Installation](#%EF%B8%8F-installation)
- [Usage](#%EF%B8%8F-usage)

## 🧠 Project Overview

Backend API for my personal AI-powered chatbot, **_Jawuan's GPT_**. This REST API handles all chat management and AI interactions, serving the [frontend client](https://github.com/jawuanlewis/jawuan-gpt-client). You can try the application here: [Jawuan's GPT](https://gpt.jawuanlewis.dev)

## 💻 Tech Stack

- **Runtime:** Node.js (>=20.0.0)
- **Framework:** Express 5
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose)
- **AI Integration:** OpenAI API (GPT-4o Mini)
- **Formatting:** Prettier

## 📁 Project Structure

```text
jawuan-gpt-api/
├── config/
│   ├── db.ts                # MongoDB connection
│   └── open-ai.ts           # OpenAI client setup
├── controllers/
│   └── chatController.ts    # Chat logic (history, prompt handling, title updates)
├── models/
│   ├── Chat.ts              # Mongoose Chat model
│   └── Message.ts           # Mongoose Message model
├── routes/
│   └── chatRoutes.ts        # Chat API route definitions
├── types/
│   └── chat.ts              # TypeScript type definitions
│
├── app.ts                   # Express app configuration and entry point
├── package.json
└── tsconfig.json
```

## 🔗 API Endpoints

All chat endpoints are prefixed with `/api/chat`. Client identity is tracked via an `X-Client-ID` header — include it in all requests to associate chats with a session.

| Method | Endpoint            | Description                       |
| ------ | ------------------- | --------------------------------- |
| GET    | `/api/chat/history` | Get all chats for the client      |
| POST   | `/api/chat/prompt`  | Send a prompt and get AI response |
| PATCH  | `/api/chat/title`   | Update the title of a chat        |

### Get chat history

```text
GET /api/chat/history
X-Client-ID: <client-id>
```

**Response:** `200 OK`

```json
{
  "chatHistory": [
    {
      "id": "abc123",
      "title": "Chat 1720000000000",
      "messages": [],
      "updatedAt": "2024-07-03T00:00:00.000Z"
    }
  ]
}
```

### Send a prompt

```text
POST /api/chat/prompt
X-Client-ID: <client-id>
```

**Request body:**

```json
{
  "prompt": "What is the capital of France?",
  "chat": { "id": "abc123" }
}
```

> Omit `chat` (or leave `chat.id` empty) to start a new conversation.

**Response:** `200 OK`

```json
{
  "chat": {
    "id": "abc123",
    "title": "Chat 1720000000000",
    "messages": [
      {
        "id": "msg1",
        "role": "user",
        "content": "What is the capital of France?"
      },
      {
        "id": "msg2",
        "role": "assistant",
        "content": "The capital of France is Paris."
      }
    ]
  }
}
```

### Update a chat title

```text
PATCH /api/chat/title
X-Client-ID: <client-id>
```

**Request body:**

```json
{
  "chatId": "abc123",
  "title": "Geography Questions"
}
```

**Response:** `200 OK`

```json
{
  "chat": {
    "id": "abc123",
    "title": "Geography Questions",
    "messages": []
  }
}
```

## ⚙️ Installation

### Prerequisites

- **Node.js** (>=20.0.0)
- **pnpm** — install via `npm install -g pnpm`
- **MongoDB** instance (local or [Atlas](https://www.mongodb.com/atlas))
- **OpenAI API Key** — get one at [platform.openai.com](https://platform.openai.com/docs/quickstart)

> Setup instructions are provided below for reference.

### Clone the repository

```bash
git clone https://github.com/jawuanlewis/jawuan-gpt-api.git
```

### Install dependencies

```bash
cd jawuan-gpt-api
pnpm install
```

### Set up environment variables

Create a `.env` file in the root directory that contains the following variables:

- **MONGO_URI:** MongoDB connection string
- **OPENAI_API_KEY:** Your OpenAI API key
- **PORT:** (Optional) Port to run the server on (default: `3000`)

### Run the development server

```bash
pnpm dev
```

## ▶️ Usage

Once the server is running, the API is available at `http://localhost:3000`. You can test it with any HTTP client:

```bash
# Get chat history
curl http://localhost:3000/api/chat/history \
  -H "X-Client-ID: my-client-id"

# Send a prompt (new conversation)
curl -X POST http://localhost:3000/api/chat/prompt \
  -H "Content-Type: application/json" \
  -H "X-Client-ID: my-client-id" \
  -d '{"prompt": "Hello!"}'

# Send a follow-up message (existing conversation)
curl -X POST http://localhost:3000/api/chat/prompt \
  -H "Content-Type: application/json" \
  -H "X-Client-ID: my-client-id" \
  -d '{"prompt": "Tell me more.", "chat": {"id": "abc123"}}'
```
