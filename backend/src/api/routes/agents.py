from enum import Enum
from logging import getLogger
import json
import time
import uuid

from typing import AsyncGenerator, List, Optional

from agno.agent import Agent
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from agents.selector import get_agent, get_available_agents

logger = getLogger(__name__)

######################################################
## Routes for the Agent Interface
######################################################

agents_router = APIRouter(prefix="/agents", tags=["Agents"])


class Model(str, Enum):
    gpt_4_1 = "gpt-4.1"
    o4_mini = "o4-mini"


@agents_router.get("", response_model=List[str])
async def list_agents():
    """
    Returns a list of all available agent IDs.

    Returns:
        List[str]: List of agent identifiers
    """
    return get_available_agents()


async def chat_response_streamer(
    agent: "Agent",  # type: ignore  # forward reference
    message: str,
    model_id: str,
    request_id: str,
) -> AsyncGenerator[str, None]:
    """Yield OpenAI-compatible SSE *chat.completion.chunk* payloads.

    Args:
        agent: The agent instance to interact with.
        message: The user message that kicked off the run.
        model_id: Identifier of the underlying model (e.g. ``"gpt-4o"``).
        request_id: Unique identifier for this request – reused across chunks.

    Yields:
        A string already prefixed with ``data: `` and terminated with a
        double-newline as required by the Server-Sent Events protocol.
    """

    created_ts = int(time.time())
    run_response = await agent.arun(message, stream=True)

    async for chunk in run_response:
        payload = {
            "id": request_id,
            "object": "chat.completion.chunk",
            "created": created_ts,
            "model": model_id,
            "choices": [
                {
                    "delta": {"content": chunk.content},
                    "index": 0,
                    "finish_reason": None,
                }
            ],
        }
        yield f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"

    # Emit the final chunk announcing completion
    final_payload = {
        "id": request_id,
        "object": "chat.completion.chunk",
        "created": created_ts,
        "model": model_id,
        "choices": [
            {
                "delta": {},
                "index": 0,
                "finish_reason": "stop",
            }
        ],
    }
    yield f"data: {json.dumps(final_payload, ensure_ascii=False)}\n\n"
    # OpenAI terminates the stream with a single [DONE] sentinel
    yield "data: [DONE]\n\n"


class RunRequest(BaseModel):
    """Request model for an running an agent"""

    message: str
    stream: bool = True
    model: Model = Model.gpt_4_1
    user_id: Optional[str] = None
    session_id: Optional[str] = None


@agents_router.post("/{agent_id}/runs", status_code=status.HTTP_200_OK)
async def create_agent_run(agent_id, body: RunRequest):
    """
    Sends a message to a specific agent and returns the response.

    Args:
        agent_id: The ID of the agent to interact with
        body: Request parameters including the message

    Returns:
        Either a streaming response or the complete agent response
    """
    logger.debug(f"RunRequest: {body}")

    try:
        agent: Agent = get_agent(
            model_id=body.model.value,
            agent_id=agent_id,
            user_id=body.user_id,
            session_id=body.session_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    if body.stream:
        request_id = str(uuid.uuid4())
        return StreamingResponse(
            chat_response_streamer(
                agent=agent,
                message=body.message,
                model_id=body.model.value,
                request_id=request_id,
            ),
            media_type="text/event-stream",
        )

    # ---------- Non-streaming / blocking variant ----------
    response = await agent.arun(body.message, stream=False)

    # Compose an OpenAI "chat.completion" payload.
    completion_payload = {
        "id": str(uuid.uuid4()),
        "object": "chat.completion",
        "created": int(time.time()),
        "model": body.model.value,
        "choices": [
            {
                "message": {"role": "assistant", "content": response.content},
                "index": 0,
                "finish_reason": "stop",
            }
        ],
        # Usage stats are optional – include `null` values if not available.
        "usage": {
            "prompt_tokens": None,
            "completion_tokens": None,
            "total_tokens": None,
        },
    }

    return completion_payload
