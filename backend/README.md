# Backend API with Agno Agents

This repository contains the backend API of the application, built on top of [Agno](https://docs.agno.com/), a lightweight framework for building AI Agents with memory, knowledge, tools, and reasoning.

## Table of Contents

- [Agents Structure](#agents-structure)
- [Usage](#usage)
  - [Listing Agents](#listing-agents)
  - [Creating and Running an Agent](#creating-and-running-an-agent)
  - [HTTP API Endpoints](#http-api-endpoints)
- [Adding a New Agent](#adding-a-new-agent)
- [Scripts](#scripts)
- [Testing](#testing)
- [Dependencies](#dependencies)

## Agents Structure

All agents live under `src/agents/`:

```text
src/agents/
├── base/               Common abstractions
│   └── builder.py      `BaseAgentBuilder` and `AgentConfig`
├── finance/            Finance Agent implementation
│   ├── builder.py
│   └── prompts/
│       ├── description.md
│       └── instructions.md
├── web/                Web Search Agent implementation
│   ├── builder.py
│   └── prompts/
│       ├── description.md
│       └── instructions.md
├── hackernews/         HackerNews Agent implementation
│   ├── builder.py
│   └── prompts/
│       ├── description.md
│       └── instructions.md
├── agno/               Agno Assist Agent implementation
│   ├── builder.py
│   ├── knowledge.py
│   └── prompts/
│       ├── description.md
│       └── instructions.md
├── registry.py         Dynamic discovery of agents
└── selector.py         Factory for instantiating agents
```

## Usage

### Listing Agents

```python
from agents.selector import get_available_agents
print(get_available_agents())
```

### Creating and Running an Agent

```python
from agents.selector import get_agent

agent = get_agent(
    agent_id="yfinance_agent",
    model_id="gpt-4.1",
    user_id="user123",
    session_id="session456",
)
response = agent.run("What is the latest stock price of TSLA?")
print(response.content)
```

### HTTP API Endpoints

The FastAPI router (`src/api/routes/agents.py`) provides:

- `GET /agents`  
  Returns a list of available agent IDs.
- `POST /agents/{agent_id}/runs`  
  Sends a message to an agent. Body:
  ```json
  {
    "message": "Your question here",
    "stream": true,
    "model": "gpt-4.1",
    "user_id": "user123",
    "session_id": "session456"
  }
  ```
- `POST /agents/{agent_id}/knowledge/load`  
  Loads (or reloads) the agent's knowledge base.

## Adding a New Agent

Use the provided cookie-cutter script to scaffold a new agent:

```bash
chmod +x scripts/new_agent.sh
scripts/new_agent.sh my_new_agent
```

This creates:
- `src/agents/my_new_agent/builder.py`
- `src/agents/my_new_agent/prompts/description.md`
- `src/agents/my_new_agent/prompts/instructions.md`

Edit these files to configure your agent's tools, description, and instructions.

## Scripts

- `scripts/new_agent.sh` — Scaffold a new agent package.

## Testing

Run all tests:

```bash
pytest
```

Ensure any new agent builders have corresponding unit tests in `tests/`.

## Dependencies

Key dependencies are listed in `pyproject.toml`:

- `agno`
- `duckduckgo-search`
- `yfinance`
- `fastapi[standard]`
- `openai`
- `pgvector`
- `sqlalchemy`
- `sqlmodel`
