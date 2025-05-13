from agno.playground import Playground  # needed before first usage

from agents.registry import AGENT_REGISTRY
import logging

from teams.selector import get_available_teams, get_team

logger = logging.getLogger(__name__)

######################################################
## Routes for the Playground Interface
######################################################

# Get Agents to serve in the playground by calling their registered getters
playground_agents = []
for agent_id, registration_info in AGENT_REGISTRY.items():
    try:
        agent_getter = registration_info["agent_getter"]
        # Instantiate with default/playground settings (e.g., debug_mode=True)
        agent_instance = agent_getter(debug_mode=True)
        playground_agents.append(agent_instance)
        logger.info(f"Successfully instantiated agent '{agent_id}' for playground.")
    except Exception as e:
        # Log a warning if an agent fails to instantiate for the playground
        logger.warning(f"Could not instantiate agent '{agent_id}' for playground: {e}", exc_info=True)
        # Optionally, decide whether to continue without this agent or raise an error

# Get Teams to serve in the playground by calling their registered getters
playground_teams = []
for team_id in get_available_teams():
    try:
        team_instance = get_team(team_id, debug_mode=True)
        playground_teams.append(team_instance)
        logger.info(f"Successfully instantiated team '{team_id}' for playground.")
    except Exception as e:
        logger.warning(f"Could not instantiate team '{team_id}' for playground: {e}", exc_info=True)

# Create a playground instance with our custom adapter that handles team response models correctly
playground = Playground(agents=playground_agents, teams=playground_teams)

# Get the router for the playground
playground_router = playground.get_async_router()
