"""Builder module defining the HackerNews tool set.

This also serves as a concrete example of how to structure tool-builder modules so
that they are automatically discovered by `tools.registry`.
"""
from __future__ import annotations

import json
from typing import List

import httpx

from tools.base.builder import ToolConfig, BaseToolBuilder


# -----------------------------------------------------------------------------
# Tool functions
# -----------------------------------------------------------------------------

def get_top_hackernews_stories(num_stories: int = 10) -> str:  # noqa: D401
    """Return the top *num_stories* from Hacker News as a JSON string.

    Parameters
    ----------
    num_stories : int, optional
        How many stories to return. Defaults to 10.

    Returns
    -------
    str
        A JSON encoded list of objects as returned by the HackerNews API.
    """

    # Fetch top story IDs
    response = httpx.get("https://hacker-news.firebaseio.com/v0/topstories.json")
    response.raise_for_status()
    story_ids: List[int] = response.json()

    # Fetch story details
    stories = []
    for story_id in story_ids[:num_stories]:
        story_response = httpx.get(f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json")
        story_response.raise_for_status()
        story = story_response.json()

        # Remove large text fields that are usually not needed for summarisation
        story.pop("text", None)
        stories.append(story)

    return json.dumps(stories)


# -----------------------------------------------------------------------------
# Config & builder entrypoints – required by tools.registry
# -----------------------------------------------------------------------------

cfg = ToolConfig(
    tool_id="hacker_news_tools",
    name="HackerNews Tools",
    description="Utilities for interacting with the Hacker News API.",
    tool_functions=[get_top_hackernews_stories],
)


def get_tools():
    """Return the list of HackerNews tool callables.

    The registry expects a function with this exact name in order to be able to
    register the tool set automatically.
    """

    return BaseToolBuilder(cfg).build() 