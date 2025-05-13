"""Module defining the base agent builder and AgentConfig dataclass for constructing agents."""
from dataclasses import dataclass
from typing import List, Optional, Any

from agno.agent import Agent
from agno.memory.v2.memory import Memory
from agno.memory.v2.db.postgres import PostgresMemoryDb
from agno.models.openai import OpenAIChat
from agno.storage.agent.postgres import PostgresAgentStorage


@dataclass
class AgentConfig:
    """
    Configuration for an agent.

    Attributes:
        agent_id (str): Unique identifier for the agent.
        name (str): Display name of the agent.
        tools (List): List of tools available to the agent.
        description (str): Description of the agent's purpose.
        instructions (str): Instructions guiding the agent's behavior.
        model_id (str): Language model identifier used by the agent.
        history_runs (int): Number of conversation history turns to include.
        table_prefix (str): Prefix for database table names.
        enable_memory (bool): Whether to enable memory for the agent.
        markdown (bool): Whether to format responses in markdown.
        debug_mode (bool): Whether to enable debug mode.
        knowledge (Optional[Any]): Additional knowledge source for the agent.
        search_knowledge (bool): Whether to search knowledge base during execution.
    """
    agent_id: str
    name: str
    tools: List
    description: str
    instructions: str
    model_id: str = "gpt-4.1"
    history_runs: int = 3
    table_prefix: str = ""
    enable_memory: bool = True
    markdown: bool = True
    debug_mode: bool = False
    knowledge: Optional[Any] = None
    search_knowledge: bool = False


class BaseAgentBuilder:
    """
    Builder for creating Agent instances based on an AgentConfig.

    The builder sets up the agent with model, tools, storage, memory, and other configurations.
    """
    def __init__(self, cfg: AgentConfig, user_id: Optional[str] = None, session_id: Optional[str] = None):
        self.cfg = cfg
        self.user_id = user_id
        self.session_id = session_id

    def build(self) -> Agent:
        """
        Build and return an Agent instance using the provided configuration and context.

        Returns:
            Agent: The constructed agent instance.
        """
        from db.session import db_url

        return Agent(
            name=self.cfg.name,
            agent_id=self.cfg.agent_id,
            description=self.cfg.description,
            instructions=self.cfg.instructions,
            knowledge=self.cfg.knowledge,
            search_knowledge=self.cfg.search_knowledge,
            model=OpenAIChat(id=self.cfg.model_id),
            tools=self.cfg.tools,
            user_id=self.user_id,
            session_id=self.session_id,
            storage=PostgresAgentStorage(
                table_name=f"{self.cfg.table_prefix}{self.cfg.agent_id}_sessions",
                db_url=db_url,
            ),
            add_history_to_messages=True,
            num_history_runs=self.cfg.history_runs,
            read_chat_history=True,
            markdown=self.cfg.markdown,
            memory=self._memory() if self.cfg.enable_memory else None,
            enable_agentic_memory=self.cfg.enable_memory,
            add_state_in_messages=True,
            add_datetime_to_instructions=True,
            debug_mode=self.cfg.debug_mode,
        )

    def _memory(self) -> Memory:
        """
        Create and return a Memory instance for the agent.

        Returns:
            Memory: Configured memory component for the agent.
        """
        from db.session import db_url

        return Memory(
            model=OpenAIChat(id=self.cfg.model_id),
            db=PostgresMemoryDb(table_name="user_memories", db_url=db_url),
            delete_memories=True,
            clear_memories=True,
        )
