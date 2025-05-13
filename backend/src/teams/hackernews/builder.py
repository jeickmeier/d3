"""
Module for building and retrieving the HackerNews AI team.

Defines builder functions for creating member agents (Hacker News and Web), configures the HackerNews team via TeamConfig, and provides get_team to instantiate the assembled team.
"""

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
    """Builds and returns the Hacker News agent.

    Args:
        model_id (str, optional): Model identifier to use; defaults to "gpt-4.1".
        user_id (str, optional): User ID for context; defaults to None.
        session_id (str, optional): Session ID for context; defaults to None.
        debug_mode (bool, optional): Enables debug mode; defaults to True.

    Returns:
        Agent: An instance of the Hacker News agent.
    """
    return get_agent(
        "hacker_news_agent", model_id=model_id, user_id=user_id, session_id=session_id, debug_mode=debug_mode
    )


def build_web_agent(
    model_id: str = "gpt-4.1",
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    debug_mode: bool = True,
):
    """Builds and returns the Web browsing agent.

    Args:
        model_id (str, optional): Model identifier; defaults to "gpt-4.1".
        user_id (str, optional): User ID; defaults to None.
        session_id (str, optional): Session ID; defaults to None.
        debug_mode (bool, optional): Enables debug mode; defaults to True.

    Returns:
        Agent: An instance of the Web browsing agent.
    """
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
    """Retrieves and constructs the HackerNews Team instance.

    Updates runtime parameters in cfg and uses BaseTeamBuilder to assemble the team.

    Args:
        model_id (str, optional): Model identifier; defaults to "gpt-4.1".
        user_id (str, optional): User ID; defaults to None.
        session_id (str, optional): Session ID; defaults to None.
        debug_mode (bool, optional): Enables debug mode; defaults to True.

    Returns:
        Team: The assembled team object.
    """
    # Update runtime parameters
    cfg.model_id = model_id
    cfg.debug_mode = debug_mode
    return BaseTeamBuilder(cfg, user_id, session_id).build()
