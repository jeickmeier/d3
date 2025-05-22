/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call */
import { createProviderRegistry } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

const googleApiKey = process.env.GOOGLE_API_KEY;
if (!googleApiKey) {
  throw new Error("Missing GOOGLE_API_KEY environment variable");
}

export const registry = createProviderRegistry({
  openai: createOpenAI({ apiKey: openaiApiKey }),
  google: createGoogleGenerativeAI({ apiKey: googleApiKey }),
});
