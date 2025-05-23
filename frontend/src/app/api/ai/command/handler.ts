/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { providers, ProviderName } from "@/lib/ai/providers";

// Request body validation schema
const RequestBodySchema = z.object({
  apiKey: z.string().optional(),
  messages: z.array(
    z.object({
      role: z.enum(["system", "data", "user", "assistant"]),
      content: z.string(),
    }),
  ),
  model: z.string().default("openai:gpt-4o"),
  system: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const bodyData = await req.json();
  const parseResult = RequestBodySchema.safeParse(bodyData);
  if (!parseResult.success) {
    const errors = parseResult.error.issues.map((i) => i.message).join(", ");
    return NextResponse.json({ error: errors }, { status: 400 });
  }
  const { apiKey, messages, model, system } = parseResult.data;

  // Determine provider and model id
  const [providerStr, modelId] = model.includes(":")
    ? model.split(":")
    : ["openai", model];
  const provider = providerStr as ProviderName;

  const streamFn = providers[provider];
  if (!streamFn) {
    return NextResponse.json(
      { error: `Unsupported AI provider: ${providerStr}` },
      { status: 400 },
    );
  }

  // Delegate to selected provider
  return streamFn({ apiKey, modelId, messages, system });
}
