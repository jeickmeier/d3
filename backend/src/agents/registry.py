import importlib
import inspect
from pathlib import Path
from typing import Dict, Any
import logging


logger = logging.getLogger(__name__)

# Structure: {'agent_id': {'module_path': str, 'agent_getter': Callable, 'knowledge_getter': Optional[Callable]}}
AGENT_REGISTRY: Dict[str, Dict[str, Any]] = {}

# Standard arguments expected by agent getter functions
EXPECTED_GETTER_ARGS = {'model_id', 'user_id', 'session_id', 'debug_mode'}

def discover_and_register_agents():
    """
    Scans the agents directory, imports valid agent modules,
    and registers their getter functions.
    """
    agents_dir = Path(__file__).parent
    logger.info(f"Starting agent discovery in: {agents_dir}")

    ignored_files = {"__init__.py", "selector.py", "registry.py"}

    for filepath in agents_dir.iterdir():
        if filepath.is_file() and filepath.name.endswith("_agent.py") and filepath.name not in ignored_files:
            agent_id = filepath.name[:-len("_agent.py")] # e.g., web_agent.py -> web_agent
            module_name = f"agents.{agent_id}_agent" # Relative module path for import
            module_path_str = f"backend.agents.{agent_id}_agent" # For display/debugging

            logger.debug(f"Found potential agent file: {filepath.name}, derived ID: {agent_id}")

            try:
                module = importlib.import_module(module_name)
                logger.debug(f"Successfully imported module: {module_name}")

                agent_getter = getattr(module, "get_agent", None)
                knowledge_getter = getattr(module, "get_knowledge", None)

                if agent_getter and callable(agent_getter):
                    # Validate signature (optional but recommended)
                    sig = inspect.signature(agent_getter)
                    params = set(sig.parameters.keys())
                    if not EXPECTED_GETTER_ARGS.issubset(params):
                         logger.warning(f"Agent getter 'get_agent' in {module_name} has unexpected signature. Expected args containing {EXPECTED_GETTER_ARGS}, got {params}. Skipping registration.")
                         continue

                    registration_info = {
                        "module_path": module_path_str,
                        "agent_getter": agent_getter,
                        "knowledge_getter": knowledge_getter if callable(knowledge_getter) else None,
                    }
                    AGENT_REGISTRY[agent_id] = registration_info
                    logger.info(f"Successfully registered agent: '{agent_id}' from {module_name}")
                    if registration_info["knowledge_getter"]:
                        logger.info(f" -> Found knowledge getter for '{agent_id}'")

                else:
                    logger.warning(f"Could not find callable function 'get_agent' in {module_name}. Skipping registration.")

            except ImportError as e:
                logger.error(f"Failed to import module {module_name}: {e}", exc_info=True)
            except Exception as e:
                logger.error(f"An unexpected error occurred processing {filepath.name}: {e}", exc_info=True)

    logger.info(f"Agent discovery complete. Registered agents: {list(AGENT_REGISTRY.keys())}")

# Run discovery when this module is imported
discover_and_register_agents() 