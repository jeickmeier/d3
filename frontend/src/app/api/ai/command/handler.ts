/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return */
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
  console.log("[AI Command] POST request to /api/ai/command", { url: req.url });
  const bodyData = await req.json();
  console.log("[AI Command] Request body:", bodyData);
  const parseResult = RequestBodySchema.safeParse(bodyData);
  if (!parseResult.success) {
    const errors = parseResult.error.issues.map((i) => i.message).join(", ");
    console.log("[AI Command] Validation errors:", errors);
    return NextResponse.json({ error: errors }, { status: 400 });
  }
  const { apiKey, messages, model, system } = parseResult.data;
  console.log("[AI Command] Parsed data:", {
    apiKey,
    model,
    system,
    messagesCount: messages.length,
  });

  // Determine provider and model id
  const [providerStr, modelId] = model.includes(":")
    ? model.split(":")
    : ["openai", model];
  console.log(
    `[AI Command] Determined provider: ${providerStr}, modelId: ${modelId}`,
  );
  const provider = providerStr as ProviderName;

  const streamFn = providers[provider];
  console.log(`[AI Command] Using stream function for provider: ${provider}`);
  if (!streamFn) {
    return NextResponse.json(
      { error: `Unsupported AI provider: ${providerStr}` },
      { status: 400 },
    );
  }

  // Delegate to selected provider
  return streamFn({ apiKey, modelId, messages, system });
}
