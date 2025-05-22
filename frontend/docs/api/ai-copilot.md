# AI Copilot API

Single-prompt AI completion via serverless edge function.

## Endpoint

POST `/api/ai/copilot`

## Environment Variables

| Name             | Description                 |
| ---------------- | --------------------------- |
| `OPENAI_API_KEY` | API key for OpenAI provider |

## Request

### Headers

- `Content-Type: application/json`

### Body Schema

```jsonc
{
  "apiKey"?: string,            // Optional override for provider-specific API key
  "prompt": string,             // The user prompt to generate completion for
  "model"?: string,             // Model selection in format "provider:modelId"; defaults to "openai:gpt-4o-mini"
  "system"?: string,            // Optional system prompt to inject before user prompt
  "maxTokens"?: number,         // Maximum tokens to generate; default 50
  "temperature"?: number        // Sampling temperature (0-1); default 0.7
}
```

## Providers

| Provider   | Prefix             | Env Key          | Example Model        |
| ---------- | ------------------ | ---------------- | -------------------- |
| **openai** | `openai:<modelId>` | `OPENAI_API_KEY` | `openai:gpt-4o-mini` |

Any other provider prefix will result in a `400 Unsupported AI provider` error.

## Response

- `Content-Type: application/json`

```jsonc
{
  "text": string,            // Generated completion text
  "usage"?: {                // Token usage details (if available)
    "promptTokens": number,
    "completionTokens": number,
    "totalTokens": number
  }
}
```

## Error Responses

- `400 Bad Request`: validation errors or unsupported provider
- `401 Unauthorized`: missing API key
- `408 Request Timeout`: request aborted
- `500 Internal Server Error`: failure processing AI request

## Example cURL

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a haiku about the sea.",
    "model": "openai:gpt-4o-mini"
  }' \
  https://your-domain.com/api/ai/copilot
```

> Note: Omit the `apiKey` field to use the value of `OPENAI_API_KEY` environment variable.
