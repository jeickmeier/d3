"""Base abstractions for constructing tool sets.

This module defines the ToolConfig dataclass and the BaseToolBuilder class, providing
an easy way to package together one or many callables that can be supplied to an
Agno `Agent` or elsewhere.
"""
from typing import List, Callable, Any, Optional

from pydantic import BaseModel, Field


class ToolConfig(BaseModel):
    """Configuration for a tool set.

    Attributes
    ----------
    tool_id : str
        Unique identifier that will be used in the tool registry.
    name : str
        Human-friendly name of the tool set.
    description : str | None
        A short description of what the tool set can do.
    tool_functions : List[Callable]
        A list with the callables that constitute the tool set. Each callable
        should already fulfil Agno's tool signature requirements.
    extra: Any
        Optional place holder for additional metadata.
    """

    tool_id: str = Field(..., description="Unique identifier for the tool set.")
    name: str = Field(..., description="Display name of the tool set.")
    description: Optional[str] = Field(None, description="Description of the tool set.")
    tool_functions: List[Callable[..., Any]] = Field(..., description="Callables that make up the tool set.")
    extra: Optional[dict] = Field(None, description="Optional extra metadata.")

    class Config:
        arbitrary_types_allowed = True


class BaseToolBuilder:
    """Builder that simply returns the list of tool callables from the config."""

    def __init__(self, cfg: ToolConfig):
        self.cfg = cfg

    def build(self) -> List[Callable[..., Any]]:
        """Return the list of tool callables defined in the config."""
        return self.cfg.tool_functions 