# Custom FastAPI SSE Streaming

This shows how to implement an OpenAI-compatible streaming endpoint in FastAPI with proper SSE framing, flushing, and media type.

```python
from fastapi import FastAPI, Request
from sse_starlette.sse import EventSourceResponse
import json
import asyncio

app = FastAPI()

@app.post("/v1/agents/{model_id}/runs")
async def run_agent(model_id: str, request: Request):
    payload = await request.json()

    async def event_generator():
        # Replace this with your actual streaming logic
        async for delta in stream_agent(model_id, payload):
            # Wrap in OpenAI-style structure
            event_data = {"choices": [{"delta": {"content": delta}}]}
            # SSE event (data: ...\n\n)
            yield f"data: {json.dumps(event_data)}\n\n"
            # yield control to event loop to flush immediately
            await asyncio.sleep(0)
        # Signal end of stream
        yield "data: [DONE]\n\n"

    return EventSourceResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache"},
    )
```
