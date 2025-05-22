import type { TextStreamPart, ToolSet } from "ai";
import { InvalidArgumentError } from "@ai-sdk/provider";
import { delay as originalDelay } from "@ai-sdk/provider-utils";
import { CHUNKING_REGEXPS } from "@/lib/ai/streaming/markdownChunker";

export type ChunkDetector = (buffer: string) => string | null | undefined;
type Delayer = (buffer: string) => number;

/**
 * Creates a TransformStream factory that smooths AI text streaming output.
 *
 * It buffers incoming text deltas and emits them in chunks determined by the
 * `chunking` strategy (word, line, list, or custom) with an optional delay
 * (`delayInMs`) between each chunk. Non-text-delta events pass through immediately.
 *
 * @typeParam TOOLS - The set of tools available during streaming.
 * @param options._internal - Internal configuration for overriding delay logic (for testing).
 * @param options.chunking - Chunk detection strategy: "word" | "line" | "list" | RegExp | custom function.
 * @param options.delayInMs - Delay in ms (or function of remaining buffer) between chunks; `null` to disable.
 * @returns A function accepting `{ tools }` that returns a TransformStream<TextStreamPart, TextStreamPart>
 * @example
 * ```ts
 * const transformer = smoothStream({ chunking: /\n+/, delayInMs: 20 })({ tools: {} });
 * const result = streamText({ experimental_transform: transformer, ... });
 * ```
 */
export function smoothStream<TOOLS extends ToolSet>({
  _internal: { delay = originalDelay } = {},
  chunking = "word",
  delayInMs = 10,
}: {
  /** Internal: override delay for testing. */
  _internal?: { delay?: (delayInMs: number | null) => Promise<void> };
  /** Strategy for splitting text into chunks. */
  chunking?: ChunkDetector | RegExp | "line" | "word" | "list";
  /** Delay between chunks. */
  delayInMs?: Delayer | number | null;
} = {}): (options: {
  tools: TOOLS;
}) => TransformStream<TextStreamPart<TOOLS>, TextStreamPart<TOOLS>> {
  let detectChunk: ChunkDetector;

  if (typeof chunking === "function") {
    detectChunk = (buffer) => {
      const match = chunking(buffer);

      if (match == null) {
        return null;
      }

      if (match.length === 0) {
        throw new Error(`Chunking function must return a non-empty string.`);
      }

      if (!buffer.startsWith(match)) {
        throw new Error(
          `Chunking function must return a match that is a prefix of the buffer. Received: "${match}" expected to start with "${buffer}"`,
        );
      }

      return match;
    };
  } else {
    const chunkingRegex =
      typeof chunking === "string" ? CHUNKING_REGEXPS[chunking] : chunking;

    if (chunkingRegex == null) {
      throw new InvalidArgumentError({
        argument: "chunking",
        message: `Chunking must be "word" or "line" or a RegExp. Received: ${chunking}`,
      });
    }

    detectChunk = (buffer) => {
      const match = chunkingRegex.exec(buffer);

      if (!match) {
        return null;
      }

      return buffer.slice(0, match.index) + match?.[0];
    };
  }

  return () => {
    let buffer = "";

    return new TransformStream<TextStreamPart<TOOLS>, TextStreamPart<TOOLS>>({
      async transform(chunk, controller) {
        if (chunk.type !== "text-delta") {
          if (buffer.length > 0) {
            controller.enqueue({ textDelta: buffer, type: "text-delta" });
            buffer = "";
          }

          controller.enqueue(chunk);
          return;
        }

        buffer += chunk.textDelta;

        let match;

        while ((match = detectChunk(buffer)) != null) {
          controller.enqueue({ textDelta: match, type: "text-delta" });
          buffer = buffer.slice(match.length);

          const _delayInMs =
            typeof delayInMs === "number"
              ? delayInMs
              : (delayInMs?.(buffer) ?? 10);

          await delay(_delayInMs);
        }
      },
    });
  };
}
