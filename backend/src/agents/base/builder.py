"""Module defining the base agent builder and AgentConfig dataclass for constructing agents."""

from typing import List, Optional, Any
from pydantic import BaseModel, Field

from agno.agent import Agent
from agno.memory.v2.memory import Memory
from agno.memory.v2.db.postgres import PostgresMemoryDb
from agno.models.openai import OpenAIChat
from agno.storage.agent.postgres import PostgresAgentStorage


class AgentConfig(BaseModel):
    agent_id: str = Field(..., description="Unique identifier for the agent.")
    name: str = Field(..., description="Display name of the agent.")
    tools: List[Any] = Field(..., description="List of tools available to the agent.")
    description: str = Field(..., description="Description of the agent's purpose.")
    instructions: str = Field(..., description="Instructions guiding the agent's behavior.")
    model_id: str = Field("gpt-4.1", description="Language model identifier used by the agent.")
    history_runs: int = Field(3, description="Number of conversation history turns to include.")
    table_prefix: str = Field("", description="Prefix for database table names.")
    enable_memory: bool = Field(True, description="Whether to enable memory for the agent.")
    markdown: bool = Field(True, description="Whether to format responses in markdown.")
    debug_mode: bool = Field(False, description="Whether to enable debug mode.")
    knowledge: Optional[Any] = Field(None, description="Additional knowledge source for the agent.")
    search_knowledge: bool = Field(False, description="Whether to search knowledge base during execution.")

    class Config:
        arbitrary_types_allowed = True


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
                table_name="agent_sessions",
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
            delete_memories=False,
            clear_memories=False,
        )
