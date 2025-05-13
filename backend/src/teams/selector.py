"""
Module for selecting and retrieving AI team instances.

This module provides functions to list available teams and instantiate them by ID from the TEAM_REGISTRY.
"""

import logging
from typing import List, Optional

from agno.team import Team
from .registry import TEAM_REGISTRY

logger = logging.getLogger(__name__)


def get_available_teams() -> List[str]:
    """Returns a list of all available team IDs."""
    return list(TEAM_REGISTRY.keys())


def get_team(
    team_id: str,
    model_id: str = "gpt-4.1",
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    debug_mode: bool = True,
) -> Team:
    """Retrieve and instantiate a Team by its ID.

    Args:
        team_id (str): The unique identifier of the team to instantiate.
        model_id (str, optional): The model identifier to use; defaults to "gpt-4.1".
        user_id (str, optional): The ID of the user; defaults to None.
        session_id (str, optional): The session identifier; defaults to None.
        debug_mode (bool, optional): Whether to enable debug mode; defaults to True.

    Returns:
        Team: An instantiated Team object.

    Raises:
        ValueError: If the team_id is not found or instantiation fails.
    """
    if team_id not in TEAM_REGISTRY:
        available = get_available_teams()
        raise ValueError(f"Team '{team_id}' not found. Available teams: {available}")
    team_getter = TEAM_REGISTRY[team_id]["team_getter"]
    try:
        team_instance = team_getter(
            model_id=model_id,
            user_id=user_id,
            session_id=session_id,
            debug_mode=debug_mode,
        )
        return team_instance
    except Exception as e:
        logger.error(f"Error instantiating team '{team_id}': {e}", exc_info=True)
        raise ValueError(f"Failed to instantiate team '{team_id}'.") from e
