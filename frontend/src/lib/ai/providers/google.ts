/* eslint-disable @typescript-eslint/require-await */
import { NextResponse } from "next/server";
import type { Message } from "ai";
import { getLanguageModel } from "../models";
import { createMarkdownChunker } from "../streaming/markdownChunker";
import { smoothStream } from "../streaming/smoothStream";
import { convertToCoreMessages, streamText } from "ai";

export async function streamGoogle({
  apiKey,
  modelId,
  messages,
  system,
}: {
  apiKey?: string;
  modelId: string;
  messages: Array<Omit<Message, "id">>;
  system?: string;
}) {
  const providerKey = apiKey ?? process.env.GOOGLE_API_KEY;
  if (!providerKey) {
    return NextResponse.json(
      { error: "Missing google API key." },
      { status: 401 },
    );
  }

  const selectedModel = getLanguageModel(`google:${modelId}`);
  const { chunk, delay } = createMarkdownChunker();

  try {
    const result = streamText({
      experimental_transform: smoothStream({
        chunking: chunk,
        delayInMs: delay,
      }),
      maxTokens: 2048,
      messages: convertToCoreMessages(messages),
      // @ts-expect-error: using string id for model
      model: selectedModel,
      system,
    });

    // Transform the stream to match customFastApi format
    const encoder = new TextEncoder();

    const messageId = `msg-${
      globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)
    }`;

    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        // Emit the metadata frame first
        controller.enqueue(
          encoder.encode(`f:${JSON.stringify({ messageId })}\n`),
        );

        try {
          // Use fullStream to access all stream events
          for await (const part of result.fullStream) {
            if (part.type === "text-delta" && part.textDelta) {
              // Emit text delta frames
              controller.enqueue(
                encoder.encode(`0:${JSON.stringify(part.textDelta)}\n`),
              );
            }
          }

          controller.close();
        } catch (error) {
          console.error("[Google] Streaming error", error);
          controller.error(error);
        }
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
    console.error("[Google] Streaming error", err);
    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 },
    );
  }
}
