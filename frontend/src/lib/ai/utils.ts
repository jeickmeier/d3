import { NextResponse } from "next/server";

/**
 * Return a JSON error response.
 * @param status HTTP status code
 * @param error Error message
 */
export function jsonError(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

/**
 * Split a model string into provider and modelId.
 * If no provider prefix is given, defaults to "openai".
 * @param modelStr e.g. "openai:gpt-4o" or "gpt-4o"
 */
export function parseModel(modelStr: string): [string, string] {
  if (modelStr.includes(":")) {
    const [provider, id] = modelStr.split(":", 2);
    return [provider, id];
  }
  return ["openai", modelStr];
}
