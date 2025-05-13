from dataclasses import dataclass
from typing import List, Callable, Optional, Union

from agno.agent import Agent
from agno.team import Team
from agno.models.openai import OpenAIChat


@dataclass
class TeamConfig:
    team_id: str
    name: str
    description: str
    instructions: Union[List[str], str]
    mode: str
    member_builders: List[Callable[..., Agent]]
    model_id: str = "gpt-4.1"
    markdown: bool = True
    debug_mode: bool = False
    show_tool_calls: bool = True
    show_members_responses: bool = True
    extra_kwargs: Optional[dict] = None


class BaseTeamBuilder:
    def __init__(
        self,
        cfg: TeamConfig,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
    ):
        self.cfg = cfg
        self.user_id = user_id
        self.session_id = session_id

    def build(self) -> Team:
        members = [
            builder(
                model_id=self.cfg.model_id,
                user_id=self.user_id,
                session_id=self.session_id,
                debug_mode=self.cfg.debug_mode,
            )
            for builder in self.cfg.member_builders
        ]
        return Team(
            name=self.cfg.name,
            team_id=self.cfg.team_id,
            members=members,
            mode=self.cfg.mode,
            model=OpenAIChat(id=self.cfg.model_id),
            instructions=self.cfg.instructions,
            user_id=self.user_id,
            session_id=self.session_id,
            markdown=self.cfg.markdown,
            show_tool_calls=self.cfg.show_tool_calls,
            show_members_responses=self.cfg.show_members_responses,
            debug_mode=self.cfg.debug_mode,
            **(self.cfg.extra_kwargs or {}),
        )
