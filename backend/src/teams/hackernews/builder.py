from pathlib import Path
from typing import Optional

from agents.selector import get_agent
from teams.base.builder import TeamConfig, BaseTeamBuilder
from agno.team import Team

# Load prompts
PROMPT_DIR = Path(__file__).parent / "prompts"
DESCRIPTION = (PROMPT_DIR / "description.md").read_text()
INSTRUCTIONS = (PROMPT_DIR / "instructions.md").read_text()


# Builder functions for member agents
def build_hn_agent(
    model_id: str = "gpt-4.1",
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    debug_mode: bool = True,
):
    return get_agent(
        "hacker_news_agent", model_id=model_id, user_id=user_id, session_id=session_id, debug_mode=debug_mode
    )


def build_web_agent(
    model_id: str = "gpt-4.1",
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    debug_mode: bool = True,
):
    return get_agent("web_agent", model_id=model_id, user_id=user_id, session_id=session_id, debug_mode=debug_mode)


# Team configuration
cfg = TeamConfig(
    team_id="hn_team",
    name="HackerNews Team",
    description=DESCRIPTION,
    instructions=INSTRUCTIONS.splitlines(),
    mode="coordinate",
    member_builders=[build_hn_agent, build_web_agent],
)


def get_team(
    model_id: str = "gpt-4.1",
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    debug_mode: bool = True,
) -> Team:
    # Update runtime parameters
    cfg.model_id = model_id
    cfg.debug_mode = debug_mode
    return BaseTeamBuilder(cfg, user_id, session_id).build()
