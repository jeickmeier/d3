import { createOpenAI } from "@ai-sdk/openai";

/**
 * Centralised helper for getting an OpenAI provider instance.
 *
 * The function falls back to the `OPENAI_API_KEY` environment variable when
 * no explicit `apiKey` argument is supplied.
 */
export function getOpenAI(apiKey?: string) {
  const key = apiKey ?? process.env.OPENAI_API_KEY;

  if (!key) {
    throw new Error("Missing OpenAI API key.");
  }

  return createOpenAI({ apiKey: key });
}

/**
 * Returns a model instance that can be passed directly to `generateText`,
 * `streamText`, …
 *
 * Example:
 *   const { text } = await generateText({
 *     model: getOpenAIModel("gpt-4o"),
 *     prompt: "Hello AI 👋",
 *   });
 */
export function getOpenAIModel(modelName: string, apiKey?: string) {
  return getOpenAI(apiKey)(modelName);
}
