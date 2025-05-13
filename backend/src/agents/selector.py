"""Module providing utilities to list and instantiate available agents from the agent registry."""

import logging
from typing import List, Optional

from agno.agent import Agent
from .registry import AGENT_REGISTRY

logger = logging.getLogger(__name__)


def get_available_agents() -> List[str]:
    """Returns a list of all available agent IDs."""
    return list(AGENT_REGISTRY.keys())


def get_agent(
    agent_id: str,
    model_id: str = "gpt-4.1",
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    debug_mode: bool = True,
) -> Agent:
    """
    Instantiate and return an Agent instance given its ID and configuration parameters.

    Args:
        agent_id (str): The unique identifier of the agent to instantiate.
        model_id (str): The model identifier to use for the agent. Defaults to "gpt-4.1".
        user_id (Optional[str]): The user identifier associated with the agent session.
        session_id (Optional[str]): The session identifier for grouping agent interactions.
        debug_mode (bool): If true, enables debug logging for the agent.

    Returns:
        Agent: An instance of the requested agent.

    Raises:
        ValueError: If the agent ID is not found in the registry or instantiation fails.
    """
    if agent_id not in AGENT_REGISTRY:
        available = get_available_agents()
        raise ValueError(f"Agent '{agent_id}' not found. Available agents: {available}")

    registration_info = AGENT_REGISTRY[agent_id]
    agent_getter = registration_info["agent_getter"]

    try:
        agent_instance = agent_getter(model_id=model_id, user_id=user_id, session_id=session_id, debug_mode=debug_mode)
        return agent_instance
    except Exception as e:
        logger.error(f"Error instantiating agent '{agent_id}' using its getter: {e}", exc_info=True)
        raise ValueError(f"Failed to instantiate agent '{agent_id}'. Check agent's get_agent function.") from e
