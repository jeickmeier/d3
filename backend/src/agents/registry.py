"""Module to discover and register agent builder modules and maintain a registry of available agents."""
import pkgutil
import importlib
from pathlib import Path
from typing import Dict, Any
import logging


logger = logging.getLogger(__name__)

# Structure: {'agent_id': {'module_path': str, 'agent_getter': Callable, 'knowledge_getter': Optional[Callable]}}
AGENT_REGISTRY: Dict[str, Dict[str, Any]] = {}


def discover_and_register_agents():
    """
    Scans the agents package for builder modules and registers their get_agent functions.
    """
    pkg_path = Path(__file__).parent
    logger.info(f"Starting agent discovery in: {pkg_path}")

    for module_info in pkgutil.walk_packages([str(pkg_path)], prefix="agents."):
        # Skip the base abstraction module
        if module_info.name.startswith("agents.base."):
            continue
        if not module_info.name.endswith(".builder"):
            continue
        try:
            module = importlib.import_module(module_info.name)
            if hasattr(module, "get_agent"):
                agent_id = getattr(module, "cfg").agent_id  # type: ignore
                agent_getter = getattr(module, "get_agent")
                knowledge_getter = getattr(module, "get_knowledge", None)
                AGENT_REGISTRY[agent_id] = {
                    "module_path": module_info.name,
                    "agent_getter": agent_getter,
                    "knowledge_getter": knowledge_getter if callable(knowledge_getter) else None,
                }
                logger.info(f"Registered agent '{agent_id}' from {module_info.name}")
        except Exception as e:
            logger.error(f"Failed to register agent from {module_info.name}: {e}", exc_info=True)

    logger.info(f"Agent discovery complete. Registered agents: {list(AGENT_REGISTRY.keys())}")


# Run discovery when this module is imported
discover_and_register_agents()
