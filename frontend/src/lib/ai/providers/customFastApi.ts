/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access */
import { NextResponse } from "next/server";
import type { Message } from "ai";

/**
 * Streams responses from a custom FastAPI backend that exposes an
 * OpenAI-compatible streaming endpoint.
 */
export async function streamCustomFastApi({
  apiKey,
  modelId,
  messages,
  system, // The FastAPI endpoint currently ignores the system prompt but we keep it for API parity
}: {
  apiKey?: string;
  modelId: string;
  messages: Array<Omit<Message, "id">>;
  system?: string;
}) {
  // Build the base URL from env or fall back to localhost
  const baseUrl = process.env.CUSTOM_FASTAPI_URL ?? "http://localhost:8000";
  const endpoint = `${baseUrl}/v1/agents/${modelId}/runs`;

  // Use the latest user/assistant message as the prompt for the custom agent.
  // If no messages are provided, default to an empty string.
  const lastMessage = messages[messages.length - 1];
  const messageContent = lastMessage?.content ?? "";

  // Assemble headers – optionally include an authorization token if provided
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  try {
    const resp = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        message: messageContent,
        stream: true,
        ...(system ? { system } : {}),
      }),
    });

    if (!resp.ok || !resp.body) {
      const errorText = await resp.text();
      return NextResponse.json(
        {
          error:
            errorText ||
            "Failed to fetch response from custom FastAPI provider.",
        },
        {
          status: resp.status,
        },
      );
    }

    // Transform FastAPI SSE → ai-sdk DataStream frames
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const messageId = `msg-${
      globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)
    }`;

    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        // Emit the metadata frame first
        controller.enqueue(
          encoder.encode(`f:${JSON.stringify({ messageId })}\n`),
        );

        const reader = resp.body!.getReader();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let newlineIdx;
          while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
            const line = buffer.slice(0, newlineIdx).trim();
            buffer = buffer.slice(newlineIdx + 1);

            if (!line.startsWith("data:")) continue;

            const payload = line.slice(5).trim();

            if (payload === "[DONE]") {
              controller.close();
              return;
            }

            try {
              const json = JSON.parse(payload);
              // OpenAI-style delta
              const delta: string | undefined =
                json?.choices?.[0]?.delta?.content;

              if (delta) {
                controller.enqueue(
                  encoder.encode(`0:${JSON.stringify(delta)}\n`),
                );
              }
            } catch {
              // ignore malformed lines
            }
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("[CustomFastApi] Streaming error", err);
    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 },
    );
  }
}
