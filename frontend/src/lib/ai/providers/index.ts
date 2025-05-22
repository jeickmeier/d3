import type { Message } from "ai";
import { streamOpenAI } from "./openai";
import { streamGoogle } from "./google";
import { streamCustomFastApi } from "./customFastApi";

/**
 * Supported provider names.
 */
export type ProviderName = "openai" | "google" | "custom";

/**
 * Options passed to every provider's streaming function.
 */
export interface StreamOptions {
  apiKey?: string;
  modelId: string;
  messages: Array<Omit<Message, "id">>;
  system?: string;
}

/**
 * Streaming function signature.
 */
export type StreamFn = (opts: StreamOptions) => Response | Promise<Response>;

/**
 * Registry of available AI providers.
 */
export const providers: Record<ProviderName, StreamFn> = {
  openai: streamOpenAI,
  google: streamGoogle,
  custom: streamCustomFastApi,
};
