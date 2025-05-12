#!/usr/bin/env bash
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <agent_name>"
  exit 1
fi

AGENT_NAME="$1"
AGENT_DIR="src/agents/${AGENT_NAME}"
PROMPTS_DIR="${AGENT_DIR}/prompts"

mkdir -p "$PROMPTS_DIR"

echo "# Description for ${AGENT_NAME} agent" > "$PROMPTS_DIR/description.md"

echo "# Instructions for ${AGENT_NAME} agent" > "$PROMPTS_DIR/instructions.md"

cat > "$AGENT_DIR/builder.py" <<EOF
from pathlib import Path
from typing import Optional

from agents.base.builder import AgentConfig, BaseAgentBuilder
from agno.agent import Agent
# TODO: import your tools here

# Load prompts
PROMPT_DIR = Path(__file__).parent / "prompts"
DESCRIPTION = (PROMPT_DIR / "description.md").read_text()
INSTRUCTIONS = (PROMPT_DIR / "instructions.md").read_text()

cfg = AgentConfig(
    agent_id="${AGENT_NAME}",
    name="${AGENT_NAME}",  # TODO: Set human-friendly name
    description=DESCRIPTION,
    instructions=INSTRUCTIONS,
    tools=[
        # TODO: Add tool instances here
    ],
)

def get_agent(
    model_id: str = "gpt-4.1",
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    debug_mode: bool = True,
) -> Agent:
    cfg.model_id = model_id
    cfg.debug_mode = debug_mode
    return BaseAgentBuilder(cfg, user_id, session_id).build()
EOF

echo "Scaffold for agent '${AGENT_NAME}' created under ${AGENT_DIR}" 