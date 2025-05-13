#!/usr/bin/env bash
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <tool_name>"
  exit 1
fi

TOOL_NAME="$1"
TOOL_DIR="src/tools/${TOOL_NAME}"

# Create tool directory structure
mkdir -p "$TOOL_DIR"

# Initialize the tool package
echo "# Package for ${TOOL_NAME} tool set" > "${TOOL_DIR}/__init__.py"

# Scaffold builder.py
cat > "${TOOL_DIR}/builder.py" << 'EOF'
"""Builder module defining the ${TOOL_NAME} tool set.

This also serves as a concrete example of how to structure tool-builder modules so
that they are automatically discovered by `tools.registry`.
"""
from __future__ import annotations

from typing import Any

from tools.base.builder import ToolConfig, BaseToolBuilder

# -----------------------------------------------------------------------------
# Tool functions
# -----------------------------------------------------------------------------

def example_${TOOL_NAME}_function(arg: Any) -> Any:  # noqa: D401
    """Example function for the ${TOOL_NAME} tool.

    Parameters
    ----------
    arg : Any
        Description of the argument.
    """
    # TODO: Implement your tool logic here
    return arg

# -----------------------------------------------------------------------------
# Config & builder entrypoints – required by tools.registry
# -----------------------------------------------------------------------------

cfg = ToolConfig(
    tool_id="${TOOL_NAME}",
    name="${TOOL_NAME}",  # human-friendly name; consider using title case
    description="Description for ${TOOL_NAME} tool set",
    tool_functions=[example_${TOOL_NAME}_function],
)

def get_tools():
    """Return the list of ${TOOL_NAME} tool callables."""
    return BaseToolBuilder(cfg).build()
EOF

echo "Scaffold for tool '${TOOL_NAME}' created under ${TOOL_DIR}" 