#!/usr/bin/env python3
"""
Script to load the knowledge base for an agent.
Usage:
    python scripts/load_agent_knowledge.py <agent_id>
"""

import argparse
import asyncio
import logging
import os
import sys

from agno.agent import AgentKnowledge
from agents.registry import AGENT_REGISTRY

# Ensure the src directory is on the Python path
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(script_dir, os.pardir))
sys.path.insert(0, os.path.join(project_root, "src"))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def load_knowledge(agent_id: str) -> int:
    if agent_id not in AGENT_REGISTRY:
        logger.error(f"Agent '{agent_id}' not found in registry.")
        return 1

    registration_info = AGENT_REGISTRY[agent_id]
    knowledge_getter = registration_info.get("knowledge_getter")

    if not knowledge_getter:
        logger.error(f"Agent '{agent_id}' does not have a registered knowledge base getter (get_knowledge).")
        return 1

    try:
        agent_knowledge: AgentKnowledge = knowledge_getter()
        await agent_knowledge.aload(upsert=True)
    except Exception as e:
        logger.error(f"Error loading knowledge base for '{agent_id}': {e}")
        return 1

    logger.info(f"Knowledge base for '{agent_id}' loaded successfully.")
    return 0


def main():
    parser = argparse.ArgumentParser(description="Load the knowledge base for a specific agent.")
    parser.add_argument("agent_id", help="The ID of the agent to load knowledge for.")
    args = parser.parse_args()

    exit_code = asyncio.run(load_knowledge(args.agent_id))
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
