import pkgutil
import importlib
from pathlib import Path
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

"""
Registry for discovery and registration of AI teams.

This module scans the teams package for builder modules and registers their get_team functions into TEAM_REGISTRY, which maps team IDs to their corresponding module path and team getter functions.
"""

# Structure: {'team_id': {'module_path': str, 'team_getter': Callable}}
TEAM_REGISTRY: Dict[str, Dict[str, Any]] = {}


def discover_and_register_teams():
    """
    Scans the teams package for builder modules and registers their get_team functions.
    """
    pkg_path = Path(__file__).parent
    logger.info(f"Starting team discovery in: {pkg_path}")

    for module_info in pkgutil.walk_packages([str(pkg_path)], prefix="teams."):
        # Skip the base abstraction module
        if module_info.name.startswith("teams.base."):
            continue
        if not module_info.name.endswith(".builder"):
            continue
        try:
            module = importlib.import_module(module_info.name)
            if hasattr(module, "get_team") and hasattr(module, "cfg"):
                team_id = getattr(module, "cfg").team_id  # type: ignore
                team_getter = getattr(module, "get_team")
                TEAM_REGISTRY[team_id] = {
                    "module_path": module_info.name,
                    "team_getter": team_getter,
                }
                logger.info(f"Registered team '{team_id}' from {module_info.name}")
        except Exception as e:
            logger.error(f"Failed to register team from {module_info.name}: {e}", exc_info=True)

    logger.info(f"Team discovery complete. Registered teams: {list(TEAM_REGISTRY.keys())}")


# Run discovery when this module is imported

discover_and_register_teams()
