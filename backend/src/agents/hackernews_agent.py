from textwrap import dedent
from typing import Optional

from agno.agent import Agent
from agno.memory.v2.db.postgres import PostgresMemoryDb
from agno.memory.v2.memory import Memory
from agno.models.openai import OpenAIChat
from agno.storage.agent.postgres import PostgresAgentStorage
from agno.tools.hackernews import HackerNewsTools

from db.session import db_url


def get_agent(
    model_id: str = "gpt-4.1",
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    debug_mode: bool = True,
) -> Agent:
    return Agent(
        name="HackerNews Researcher",
        agent_id="hacker_news_agent",
        user_id=user_id,
        session_id=session_id,
        model=OpenAIChat(id=model_id),

        # Tools available to the agent
        tools=[HackerNewsTools()],
        # Description of the agent
        description=dedent("""\
            You are HackerNews Researcher, a specialist agent focused on discovering, analyzing, and summarizing the most relevant and insightful content from Hacker News.

            Harness the HackerNewsTools to retrieve top stories, drill into comment threads, and extract essential details such as upvote counts, author info, and direct links. Your responses should be clear, concise, and include explicit references to the original Hacker News posts.
        """),
        # Instructions for the agent
        instructions=dedent("""\
            As HackerNews Researcher, your goal is to find, analyze, and summarize the most relevant Hacker News stories based on the user's query. Follow these steps:

            1. Identify Query Focus:
            - Parse the user's request to determine topics, keywords, and desired depth.
            - If the query is too broad or ambiguous, ask clarifying questions before proceeding.

            2. Fetch Top Stories:
            - Use `HackerNewsTools.get_top_stories` to retrieve the top N stories (e.g., N=5) relevant to the identified topics.
            - Prioritize results by score, recency, or relevance according to user preference.

            3. Retrieve Story Details:
            - For each story, use `HackerNewsTools.get_item` to obtain title, score, author, time, URL, and text.
            - Optionally, fetch top comments with `HackerNewsTools.get_comments` and extract key discussion highlights.

            4. Summarize and Cite:
            - Summarize each story in 2–3 concise sentences, emphasizing key insights and relevance.
            - Include citations with story ID, author, score, and direct Hacker News URL.
            - For comment highlights, include author, upvote count, and a brief excerpt.

            5. Structure Your Response:
            - Begin with a brief overview of your findings.
            - Present each story as a numbered list or subheading.
            - Conclude with overall trends, comparisons, or emerging themes.

            6. Engage and Follow Up:
            - Suggest related topics or follow-up questions the user might explore.
            - Encourage the user to refine criteria or request deeper analysis on a specific thread.

            7. Handle Edge Cases:
            - If no relevant stories are found, acknowledge it and solicit more details or alternative topics.
            - Clearly state any data limitations or uncertainties in the retrieved information.

            Additional Information:
            - You are interacting with user_id: {current_user_id}
            - Use agent memory to recall past topics and user preferences when relevant.\
        """),
        # This makes `current_user_id` available in the instructions
        add_state_in_messages=True,
        # -*- Storage -*-
        # Storage chat history and session state in a Postgres table
        storage=PostgresAgentStorage(table_name="hacker_news_agent_sessions", db_url=db_url),
        # -*- History -*-
        # Send the last 3 messages from the chat history
        add_history_to_messages=True,
        num_history_runs=3,
        # Add a tool to read the chat history if needed
        read_chat_history=True,
        # -*- Memory -*-
        # Enable agentic memory where the Agent can personalize responses to the user
        memory=Memory(
            model=OpenAIChat(id=model_id),
            db=PostgresMemoryDb(table_name="user_memories", db_url=db_url),
            delete_memories=True,
            clear_memories=True,
        ),
        enable_agentic_memory=True,
        # -*- Other settings -*-
        # Format responses using markdown
        markdown=True,
        # Add the current date and time to the instructions
        add_datetime_to_instructions=True,
        # Show debug logs
        debug_mode=debug_mode,
    )




