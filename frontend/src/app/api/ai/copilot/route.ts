import type { NextRequest } from "next/server";

import { getOpenAIModel } from "@/lib/ai/openai";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Parse and type the request body to avoid unsafe any assignments
  const body = (await req.json()) as {
    apiKey?: string;
    model?: string;
    prompt: string;
    system?: string;
  };

  const { apiKey: key, model = "gpt-4o-mini", prompt, system } = body;

  const apiKey = key ?? process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OpenAI API key." },
      { status: 401 },
    );
  }

  const modelInstance = getOpenAIModel(model, apiKey);

  try {
    const result = await generateText({
      abortSignal: req.signal,
      maxTokens: 50,
      model: modelInstance,
      prompt: prompt,
      system,
      temperature: 0.7,
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
