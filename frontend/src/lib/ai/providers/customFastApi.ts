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
    Accept: "text/event-stream",
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
          buffer += decoder.decode(value ?? new Uint8Array(), {
            stream: !done,
          });

          if (done) {
            // Flush any remaining multi-byte chars
            buffer += decoder.decode();
          }

          // Split events on double newlines (handles LF and CRLF)
          let eventEnd;
          while ((eventEnd = buffer.search(/\r?\n\r?\n/)) !== -1) {
            const rawEvent = buffer.slice(0, eventEnd);
            // Advance past the delimiter (2 or 4 chars)
            buffer = buffer.slice(
              eventEnd + (buffer[eventEnd] === "\r" ? 4 : 2),
            );

            // Process each data: line in the event
            const lines = rawEvent.split(/\r?\n/);
            for (const line of lines) {
              if (!line.startsWith("data:")) continue;
              // Extract the payload after "data:" without trimming internal spaces
              const payload = line.startsWith("data: ")
                ? line.slice(6)
                : line.slice(5);
              if (payload === "[DONE]") {
                controller.close();
                return;
              }
              try {
                const json = JSON.parse(payload);
                const delta = json?.choices?.[0]?.delta?.content;
                if (delta != null) {
                  controller.enqueue(
                    encoder.encode(`0:${JSON.stringify(delta)}\n`),
                  );
                }
              } catch {
                // ignore parsing errors
              }
            }
          }

          if (done) break;
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
