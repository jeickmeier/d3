from typing import List
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.team import Team
from typing import Optional

from agents.web_agent import get_agent as get_web_agent_instance
from agents.hackernews_agent import get_agent as get_hackernews_agent_instance

web_searcher = get_web_agent_instance()
hn_researcher = get_hackernews_agent_instance()


def get_hn_team(
    model_id: str = "gpt-4.1",
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    debug_mode: bool = True,
) -> Team:
    return Team(
        name="HackerNews Team",
        team_id="hn_team",
        user_id=user_id,
        session_id=session_id,
        model=OpenAIChat(id=model_id),
        
        mode="coordinate",  # Could also use 'collaborate' or 'route'
        members=[hn_researcher, web_searcher],
        instructions=[
            "First, search for relevant posts on HackerNews.",
            "Then, ask the web searcher to find more information on each story.",
            "Finally, summarize and provide an engaging overview in an article format."
        ],
        
        show_tool_calls=True,
        markdown=True,
        debug_mode=debug_mode,
        show_members_responses=True,
    )