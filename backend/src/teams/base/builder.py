"""
Base abstractions for constructing AI teams.

This module defines the TeamConfig dataclass and the BaseTeamBuilder class, which together specify team setup and instantiate Team objects with configured member agents.
"""

from typing import List, Callable, Optional, Union, Dict, Any, Literal
from pydantic import BaseModel, Field

from agno.agent import Agent
from agno.team import Team
from agno.models.openai import OpenAIChat


class TeamConfig(BaseModel):
    team_id: str = Field(..., description="Unique identifier for the team.")
    name: str = Field(..., description="Display name of the team.")
    description: str = Field(..., description="Description of the team's purpose.")
    instructions: Union[List[str], str] = Field(
        ..., description="Guidance or instructions for the team; can be a list of strings or a single string."
    )
    mode: Literal["route", "coordinate", "collaborate"] = Field(..., description="Coordination mode for the team.")
    member_builders: List[Callable[..., Agent]] = Field(..., description="Callables to construct agent members.")
    model_id: str = Field("gpt-4.1", description="Default model identifier.")
    markdown: bool = Field(True, description="Whether to format outputs in Markdown.")
    debug_mode: bool = Field(False, description="Whether to enable debug logging.")
    show_tool_calls: bool = Field(True, description="Whether to include tool call traces.")
    show_members_responses: bool = Field(True, description="Whether to include raw member responses.")
    extra_kwargs: Optional[Dict[str, Any]] = Field(
        None, description="Additional keyword arguments for Team constructor."
    )

    class Config:
        arbitrary_types_allowed = True


class BaseTeamBuilder:
    """Builder for assembling Team objects from TeamConfig.

    Encapsulates logic to construct agent members and wrap them into a Team.
    """

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
        """Constructs and returns a Team instance using the configuration.

        Instantiates each agent via member_builders and packages them into a Team.

        Returns:
            Team: The fully built team with all members and settings.
        """
        members: List[Agent | Team] = [
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
