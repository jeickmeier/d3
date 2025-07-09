import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { providers, type ProviderName } from "@/lib/ai/providers";
import { generateText } from "ai";
import { getLanguageModel } from "@/lib/ai/models";

const RequestSchema = z.object({
  apiKey: z.string().optional(),
  prompt: z.string(),
  model: z.string().default("gpt-4o-mini"),
  system: z.string().optional(),
  maxTokens: z.number().int().positive().default(50),
  temperature: z.number().min(0).max(1).default(0.7),
});

export async function POST(req: NextRequest) {
  const parseResult = RequestSchema.safeParse(await req.json());
  if (!parseResult.success) {
    const errors = parseResult.error.issues.map((i) => i.message).join(", ");
    return NextResponse.json({ error: errors }, { status: 400 });
  }

  const {
    apiKey: key,
    prompt,
    model,
    system,
    maxTokens,
    temperature,
  } = parseResult.data;
  const apiKey = key ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OpenAI API key." },
      { status: 401 },
    );
  }

  // Determine provider and model id
  const [providerStr, modelId] = model.includes(":")
    ? model.split(":")
    : (["openai", model] as [string, string]);
  const provider = providerStr as ProviderName;
  const streamFn = providers[provider];
  if (!streamFn) {
    return NextResponse.json(
      { error: `Unsupported AI provider: ${providerStr}` },
      { status: 400 },
    );
  }

  // For non-OpenAI providers, delegate to streaming provider
  if (providerStr !== "openai") {
    return streamFn({
      apiKey,
      modelId,
      messages: [{ role: "user", content: prompt }],
      system,
    });
  }

  // Define the model for OpenAI requests
  const modelInstance = getLanguageModel(`openai:${modelId}`);

  try {
    const result = await generateText({
      // @ts-expect-error: using string id for model
      model: modelInstance,
      prompt,
      system,
      maxTokens,
      temperature,
      abortSignal: req.signal,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(null, { status: 408 });
    }
    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 },
    );
  }
}
