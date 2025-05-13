#!/usr/bin/env bash
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <team_name>"
  exit 1
fi

TEAM_NAME="$1"
TEAM_DIR="src/teams/${TEAM_NAME}"
PROMPTS_DIR="${TEAM_DIR}/prompts"

# Create team directory structure
mkdir -p "$PROMPTS_DIR"

# Initialize the team package
echo "# Package for ${TEAM_NAME} team" > "${TEAM_DIR}/__init__.py"

# Scaffold prompts
echo "# Description for ${TEAM_NAME} team" > "${PROMPTS_DIR}/description.md"
echo "# Instructions for ${TEAM_NAME} team" > "${PROMPTS_DIR}/instructions.md"

# Scaffold builder.py
cat > "${TEAM_DIR}/builder.py" << 'EOF'
from pathlib import Path
from typing import Optional

from teams.base.builder import TeamConfig, BaseTeamBuilder
from agno.team import Team

# Load prompts
PROMPT_DIR = Path(__file__).parent / "prompts"
DESCRIPTION = (PROMPT_DIR / "description.md").read_text()
INSTRUCTIONS = (PROMPT_DIR / "instructions.md").read_text()

# Member builders: define builder functions for your agents or sub-teams
# Example:
# from agents.selector import get_agent
# def build_some_agent(model_id: str = "gpt-4.1", user_id: Optional[str] = None, session_id: Optional[str] = None, debug_mode: bool = True):
#     return get_agent("some_agent", model_id=model_id, user_id=user_id, session_id=session_id, debug_mode=debug_mode)

cfg = TeamConfig(
    team_id=TEAM_NAME,
    name=TEAM_NAME,
    description=DESCRIPTION,
    instructions=INSTRUCTIONS.splitlines(),  # or keep as string
    mode="coordinate",  # choose from 'coordinate', 'route', or 'collaborate'
    member_builders=[
        # add builder functions here
    ],
)

def get_team(
    model_id: str = "gpt-4.1",
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    debug_mode: bool = True,
) -> Team:
    cfg.model_id = model_id
    cfg.debug_mode = debug_mode
    return BaseTeamBuilder(cfg, user_id, session_id).build()
EOF

echo "Scaffold for team '${TEAM_NAME}' created under ${TEAM_DIR}" 