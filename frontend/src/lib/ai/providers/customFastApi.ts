import { NextResponse } from "next/server";
import type { Message } from "ai";

export async function streamCustomFastApi({
  modelId,
  messages,
}: {
  apiKey?: string;
  modelId: string;
  messages: Array<Omit<Message, "id">>;
  system?: string;
}) {
  console.log("[customFastApi] Starting streamCustomFastApi", {
    modelId,
    messagesCount: messages.length,
  });
  const fastapiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/agents/${modelId}/runs`;
  const lastUser = messages.filter((m) => m.role === "user").pop();
  const userMsg = lastUser?.content ?? "";
  console.log(
    `[customFastApi] Requesting stream from ${fastapiUrl} with message: ${userMsg}`,
  );
  const pythonRes = await fetch(fastapiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMsg, stream: true, model: modelId }),
  });
  console.log("[customFastApi] Fetch completed", { status: pythonRes.status });
  return wrapPythonSSE(pythonRes);
}

function wrapPythonSSE(res: Response) {
  console.log("[customFastApi] wrapPythonSSE called with response", res);
  const te = new TextEncoder();
  const td = new TextDecoder();
  const reader = res.body!.getReader();
  let buf = "";

  const stream = new ReadableStream({
    async start(controller) {
      console.log("[customFastApi] Starting to stream SSE chunks");
      while (true) {
        console.log("[customFastApi] Waiting for next chunk...");
        const { value, done } = await reader.read();
        console.log("[customFastApi] Chunk read", {
          done,
          chunkLength: value?.length,
        });
        if (done) break;
        buf += td.decode(value, { stream: true });

        let idx;
        while ((idx = buf.indexOf("\n\n")) !== -1) {
          const raw = buf.slice(0, idx).trim();
          buf = buf.slice(idx + 2);
          console.log("[customFastApi] Raw SSE chunk:", raw);
          if (!raw.startsWith("data:")) continue;
          const chunk = raw.replace(/^data:\s*/, "");
          console.log("[customFastApi] Data chunk:", chunk);
          const out = JSON.stringify({ type: "text-delta", textDelta: chunk });
          controller.enqueue(te.encode(`data: ${out}\n\n`));
        }
      }
      console.log("[customFastApi] SSE stream ended, enqueueing done event");
      controller.enqueue(te.encode(`data: {"type":"done"}\n\n`));
      controller.close();
    },
  });
  console.log(
    "[customFastApi] wrapPythonSSE returning NextResponse with event-stream headers",
  );
  return new NextResponse(stream, {
    headers: { "Content-Type": "text/event-stream" },
  });
}
