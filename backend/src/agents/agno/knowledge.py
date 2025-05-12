from agno.agent import AgentKnowledge
from agno.embedder.openai import OpenAIEmbedder
from agno.knowledge.url import UrlKnowledge
from agno.vectordb.pgvector import PgVector, SearchType
from db.session import db_url


def get_knowledge() -> AgentKnowledge:
    return UrlKnowledge(
        urls=["https://docs.agno.com/llms-full.txt"],
        vector_db=PgVector(
            db_url=db_url,
            table_name="agno_assist_knowledge",
            search_type=SearchType.hybrid,
            embedder=OpenAIEmbedder(id="text-embedding-3-small"),
        ),
    ) 