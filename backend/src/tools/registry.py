"""Module to discover and register tool builder modules and maintain a registry of available tool sets."""

from __future__ import annotations

import importlib
import logging
import pkgutil
from pathlib import Path
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Registry structure: {"tool_id": {"module_path": str, "tools": List[Callable]}}
TOOL_REGISTRY: Dict[str, Dict[str, Any]] = {}


def discover_and_register_tools() -> None:
    """Discover builder modules inside the ``tools`` package and register their tool sets.

    Each builder module must:
    * Live somewhere inside the ``tools`` Python package (``src/tools`` directory).
    * Have a filename that ends with ``builder.py``.
    * Expose a global ``cfg`` variable which is an instance of ``tools.base.builder.ToolConfig``.
    * Expose a ``get_tools`` callable returning an *iterable* of tool callables.
    """

    pkg_path = Path(__file__).parent
    logger.info("Starting tool discovery in: %s", pkg_path)

    # Iterate over every python module in sub-packages of ``tools``
    for module_info in pkgutil.walk_packages([str(pkg_path)], prefix="tools."):
        # Skip the base abstractions package
        if module_info.name.startswith("tools.base."):
            continue
        if not module_info.name.endswith(".builder"):
            continue

        try:
            module = importlib.import_module(module_info.name)

            # Basic validation
            if not hasattr(module, "get_tools") or not hasattr(module, "cfg"):
                continue

            cfg = getattr(module, "cfg")  # ToolConfig instance
            tool_id = getattr(cfg, "tool_id", None)
            if not tool_id:
                continue

            tools_list = getattr(module, "get_tools")()
            TOOL_REGISTRY[tool_id] = {
                "module_path": module_info.name,
                "tools": list(tools_list),
            }
            logger.info("Registered tool set '%s' from %s", tool_id, module_info.name)
        except Exception as exc:
            logger.error("Failed to register tool set from %s: %s", module_info.name, exc, exc_info=True)

    logger.info("Tool discovery complete. Registered tool sets: %s", list(TOOL_REGISTRY.keys()))


# Run discovery at import time

discover_and_register_tools()
