# AI Command API

Publishes a streaming AI chat completion via serverless edge functions.

## Endpoint

POST `/api/ai/command`

## Environment Variables

| Name                   | Description                                                |
| ---------------------- | ---------------------------------------------------------- |
| `OPENAI_API_KEY`       | API key for OpenAI provider (if using `openai` provider).  |
| `GOOGLE_API_KEY`       | API key for Google provider (if using `google` provider).  |
| `NEXT_PUBLIC_BASE_URL` | Base URL for custom FastAPI agent (for `custom` provider). |

## Request

### Headers

- `Content-Type: application/json`

### Body Schema

```jsonc
{
  // Optional override for provider-specific API key
  "apiKey"?: string,
  // Array of chat messages; `role` must be one of: "system", "user", "assistant", "data"
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user",   "content": "Hello, world!" }
  ],
  // Model selection in format "provider:modelId"; defaults to "openai:gpt-4o"
  "model"?: string,
  // Optional system prompt to inject before messages
  "system"?: string,
}
```

## Providers

| Provider   | Prefix             | Env Key               | Example Model     |
| ---------- | ------------------ | --------------------- | ----------------- |
| **openai** | `openai:<modelId>` | `OPENAI_API_KEY`      | `openai:gpt-4o`   |
| **google** | `google:<modelId>` | `GOOGLE_API_KEY`      | `google:gemini-1` |
| **custom** | `custom:<agentId>` | (none, uses Base URL) | `custom:my-agent` |

- **custom** proxies requests to a FastAPI agent at `${NEXT_PUBLIC_BASE_URL}/agents/{agentId}/runs`.

## Response

- `Content-Type: text/event-stream`
- Streams SSE events with AI SDK text-delta format:

  ```sse
  data: {"type":"text-delta","textDelta":"Hello"}

  data: {"type":"text-delta","textDelta":" world!"}

  data: {"type":"done"}
  ```

Clients should open the stream and process each `text-delta` event to render incremental output.

## Error Responses

- `400 Bad Request`: validation errors or unsupported provider
- `401 Unauthorized`: missing API key for `openai` or `google`
- `500 Internal Server Error`: failure processing AI request

## Example cURL

```bash
curl -N \
  -H "Content-Type: application/json" \
  -d '{
    "messages":[{"role":"user","content":"Tell me a joke."}],
    "model":"openai:gpt-4o"
  }' \
  https://your-domain.com/api/ai/command
```

> The `-N` flag disables buffering to correctly receive SSE in real-time.
