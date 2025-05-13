"""Agent builder for the HackerNews Researcher: constructs the agent with its prompts and HN tools."""

from pathlib import Path
from typing import Optional

from tools.hackernews.builder import get_tools as get_top_hackernews_stories
from agents.base.builder import AgentConfig, BaseAgentBuilder
from agno.agent import Agent

# Load prompts
PROMPT_DIR = Path(__file__).parent / "prompts"
DESCRIPTION = (PROMPT_DIR / "description.md").read_text()
INSTRUCTIONS = (PROMPT_DIR / "instructions.md").read_text()

cfg = AgentConfig(
    agent_id="hacker_news_agent",
    name="HackerNews Researcher",
    description=DESCRIPTION,
    instructions=INSTRUCTIONS,
    tools=get_top_hackernews_stories(),
)


def get_agent(
    model_id: str = "gpt-4.1",
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    debug_mode: bool = True,
) -> Agent:
    """
    Instantiate and return the HackerNews Researcher agent with specified model and context.

    Args:
        model_id (str): Identifier of the language model to use. Defaults to "gpt-4.1".
        user_id (Optional[str]): Identifier for the user context.
        session_id (Optional[str]): Identifier for the session context.
        debug_mode (bool): Whether to enable debug logging.

    Returns:
        Agent: An instance of the HackerNews Researcher agent.
    """
    cfg.model_id = model_id
    cfg.debug_mode = debug_mode
    return BaseAgentBuilder(cfg, user_id, session_id).build()
