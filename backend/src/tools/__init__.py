"""Public interface for the `tools` package.

Importing this package will trigger discovery of tool sets via the registry
module and make the ``TOOL_REGISTRY`` symbol available at package level.
"""
from .registry import TOOL_REGISTRY  # noqa: F401
