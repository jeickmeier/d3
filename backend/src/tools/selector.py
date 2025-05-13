"""Utilities to access tool sets registered in tools.registry."""
from __future__ import annotations

from typing import List, Callable

from .registry import TOOL_REGISTRY


def get_available_toolsets() -> List[str]:
    """Return the IDs for all discovered tool sets."""
    return list(TOOL_REGISTRY.keys())


def get_tools(tool_id: str) -> List[Callable]:
    """Return the list of tool callables for *tool_id*.

    Raises
    ------
    ValueError
        If *tool_id* is not present in the registry.
    """
    if tool_id not in TOOL_REGISTRY:
        available = get_available_toolsets()
        raise ValueError(f"Tool set '{tool_id}' not found. Available tool sets: {available}")

    return TOOL_REGISTRY[tool_id]["tools"] 