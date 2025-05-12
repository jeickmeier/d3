from pathlib import Path
from typing import Optional

from agno.tools.hackernews import HackerNewsTools
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
    tools=[HackerNewsTools()],
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