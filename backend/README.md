# Backend API with Agno Agents

This repository contains the backend API of the application, built on top of [Agno](https://docs.agno.com/), a lightweight framework for building AI Agents with memory, knowledge, tools, and reasoning.

## Table of Contents

- [Structures](#structures)
    - [Agents](#agents-structure)
    - [Tools](#tools-structure)
    - [Teams](#teams-structure)
- [Usage](#usage)
    - [Listing Agents](#listing-agents)
    - [Creating and Running an Agent](#creating-and-running-an-agent)
    - [HTTP API Endpoints](#http-api-endpoints)
    - [Using the Playground](#using-the-playground)
- [Adding new Agents/Teams/Tools](#adding-new-agentsteamstools)
    - [Adding a New Agent](#adding-a-new-agent)
    - [Adding a New Team](#adding-a-new-team)
    - [Adding a New Tool](#adding-a-new-tool)
- [Scripts](#scripts)
- [Testing](#testing)
- [Dependencies](#dependencies)

## Structures

### Agents

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

### Tools

All tools live under `src/tools/`:

```text
src/tools/
├── base/               Common tool abstractions
│   └── builder.py      `BaseToolBuilder` and `ToolConfig`
├── hackernews/         HackerNews Tool implementation
│   └── builder.py
├── registry.py         Dynamic discovery of tools
└── selector.py         Factory for instantiating tools
```

### Teams

All teams live under `src/teams/`:

```text
src/teams/
├── base/               Common team abstractions
│   └── builder.py      `BaseTeamBuilder` and `TeamConfig`
├── hackernews/         HackerNews Team implementation
│   ├── builder.py
│   └── prompts/
│       ├── description.md
│       └── instructions.md
├── registry.py         Dynamic discovery of teams
└── selector.py         Factory for instantiating teams
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

### Using the Playground

The Playground UI is included in the Docker configuration and will automatically run on port 8000 once your containers are up.

Authenticate with Agno:

```bash
ag setup
```

or export your `AGNO_API_KEY`:

```bash
export AGNO_API_KEY=ag-<YOUR_API_KEY>
```

Bring up the application using Docker:

```bash
docker-compose up -d
```

Access the Playground at http://localhost:8000

## Adding new Agents/Teams/Tools

### Adding a New Agent

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

### Adding a New Team

Use the provided cookie-cutter script to scaffold a new team:

```bash
chmod +x scripts/new_team.sh
scripts/new_team.sh my_new_team
```

This creates:
- `src/teams/my_new_team/__init__.py`
- `src/teams/my_new_team/builder.py`
- `src/teams/my_new_team/prompts/description.md`
- `src/teams/my_new_team/prompts/instructions.md`

Edit these files to configure your team's behavior, prompts, and instructions.

### Adding a New Tool

Use the provided cookie-cutter script to scaffold a new tool:

```bash
chmod +x scripts/new_tool.sh
scripts/new_tool.sh my_new_tool
```

This creates:
- `src/tools/my_new_tool/__init__.py`
- `src/tools/my_new_tool/builder.py`

Edit these files to configure your tool's functions and metadata.

## Scripts

- `scripts/new_agent.sh` — Scaffold a new agent package.
- `scripts/new_team.sh` — Scaffold a new team package.
- `scripts/new_tool.sh` — Scaffold a new tool package.

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