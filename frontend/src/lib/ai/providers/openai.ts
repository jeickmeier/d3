import { NextResponse } from "next/server";
import type { Message } from "ai";
import { getLanguageModel } from "../models";
import { createMarkdownChunker } from "../streaming/markdownChunker";
import { smoothStream } from "../streaming/smoothStream";
import { convertToCoreMessages, streamText } from "ai";

export function streamOpenAI({
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
  const providerKey = apiKey ?? process.env.OPENAI_API_KEY;
  if (!providerKey) {
    return NextResponse.json(
      { error: "Missing openai API key." },
      { status: 401 },
    );
  }
  const selectedModel = getLanguageModel(`openai:${modelId}`);
  const { chunk, delay } = createMarkdownChunker();
  try {
    const result = streamText({
      experimental_transform: smoothStream({
        chunking: chunk,
        delayInMs: delay,
      }),
      maxTokens: 2048,
      messages: convertToCoreMessages(messages),
      model: selectedModel,
      system,
    });
    return result.toDataStreamResponse();
  } catch {
    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 },
    );
  }
}
