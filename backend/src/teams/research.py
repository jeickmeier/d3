from agno.models.openai import OpenAIChat
from agno.team import Team
from typing import Optional
from agents.selector import get_agent


def get_hn_team(
    model_id: str = "gpt-4.1",
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    debug_mode: bool = True,
) -> Team:

    hn_researcher = get_agent(
        agent_id="hackernews",
        model_id=model_id,
        user_id=user_id,
    )
    web_searcher = get_agent(
        agent_id="web",
        model_id=model_id,
        user_id=user_id,
    )

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
            "Finally, summarize and provide an engaging overview in an article format.",
        ],
        show_tool_calls=True,
        markdown=True,
        debug_mode=debug_mode,
        show_members_responses=True,
    )
