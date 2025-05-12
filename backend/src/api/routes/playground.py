from pydantic import BaseModel, field_validator
from agno.playground import schemas as _agno_schemas
from agno.playground import Playground  # needed before first usage
import agno.playground.async_router as _agno_async_router

from agents.registry import AGENT_REGISTRY
import logging

from teams.research import get_hn_team

logger = logging.getLogger(__name__)

######################################################
## Routes for the Playground Interface
######################################################

# Get Agents to serve in the playground by calling their registered getters
playground_agents = []
for agent_id, registration_info in AGENT_REGISTRY.items():
    try:
        agent_getter = registration_info['agent_getter']
        # Instantiate with default/playground settings (e.g., debug_mode=True)
        agent_instance = agent_getter(debug_mode=True)
        playground_agents.append(agent_instance)
        logger.info(f"Successfully instantiated agent '{agent_id}' for playground.")
    except Exception as e:
        # Log a warning if an agent fails to instantiate for the playground
        logger.warning(f"Could not instantiate agent '{agent_id}' for playground: {e}", exc_info=True)
        # Optionally, decide whether to continue without this agent or raise an error

# Keep team loading separate for now
hnews_team = get_hn_team(debug_mode=True)

# Create a playground instance with our custom adapter that handles team response models correctly
playground = Playground(agents=playground_agents, teams=[hnews_team])

# Get the router for the playground
playground_router = playground.get_async_router()

# ---------------------------------------------------------------------------
# Patch Agno playground schema to allow BaseModel classes for `response_model`
# ---------------------------------------------------------------------------

class _PatchedTeamGetResponse(_agno_schemas.TeamGetResponse):
    """Allow passing a Pydantic BaseModel *class* as `response_model`."""

    @field_validator("response_model", mode="before")
    @classmethod
    def _convert_response_model(cls, v):  # noqa: N805 – pydantic validator API
        if isinstance(v, type) and issubclass(v, BaseModel):
            return v.__name__
        return v


# Replace references in both `schemas` and `async_router` so future imports,
# as well as the already-imported router module, use the patched class.
_agno_schemas.TeamGetResponse = _PatchedTeamGetResponse
if hasattr(_agno_async_router, "TeamGetResponse"):
    _agno_async_router.TeamGetResponse = _PatchedTeamGetResponse


# Import after patching so that `Playground` and downstream modules pick up the
# patched version.
from agno.playground import Playground  # noqa: E402