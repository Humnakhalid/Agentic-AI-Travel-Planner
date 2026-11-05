
import os
import sqlite3
import ast
import operator
import requests
from typing import Annotated, TypedDict

from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.prebuilt import ToolNode, tools_condition

from langchain_ollama import ChatOllama
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.tools import tool

from pathlib import Path
from dotenv import load_dotenv
from langchain_tavily import TavilySearch

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

# ============================================================
# 1. WEATHER TOOL
# ============================================================

@tool
def get_weather(location: str) -> str:
    """Get current weather for a city.
    Use for current temperature, rain, humidity, precipitation,
    wind speed, and other current weather conditions.
    """

    try:
        # Find city coordinates
        geo_response = requests.get(
            "https://geocoding-api.open-meteo.com/v1/search",
            params={
                "name": location.split(",")[0].strip(),
                "count": 1,
                "language": "en",
                "format": "json",
            },
            timeout=15,
        )
        geo_response.raise_for_status()
        geo_data = geo_response.json()

        if not geo_data.get("results"):
            return f"Could not find location: {location}"

        place = geo_data["results"][0]
        latitude = place["latitude"] 
        longitude = place["longitude"]
        city = place["name"]
        country = place.get("country", "")

        # Request current weather
        weather_response = requests.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": latitude,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
                "longitude": longitude,
                "current": (
                    "temperature_2m,"
                    "relative_humidity_2m,"
                    "apparent_temperature,"
                    "precipitation,"
                    "rain,"
                    "weather_code,"
                    "wind_speed_10m"
                ),
                "temperature_unit": "celsius",
                "wind_speed_unit": "kmh",
            },
            timeout=15,
        )
        weather_response.raise_for_status()

        current = weather_response.json()["current"]

        return (
            f"Location: {city}, {country}\n"
            f"Time: {current['time']}\n"
            f"Temperature: {current['temperature_2m']}°C\n"
            f"Feels like: {current['apparent_temperature']}°C\n"
            f"Humidity: {current['relative_humidity_2m']}%\n"
            f"Precipitation: {current['precipitation']} mm\n"
            f"Rain: {current['rain']} mm\n"
            f"Wind speed: {current['wind_speed_10m']} km/h\n"
            f"Weather code: {current['weather_code']}"
        )

    except (requests.RequestException, KeyError, ValueError) as exc:
        return f"Weather lookup failed: {exc}"


# ============================================================
# 2. Tavily search TOOL
# ============================================================

tavily_search = TavilySearch(
    max_results=5,
    topic="general",
)

# ============================================================
# 3. REGISTER TOOLS
# ============================================================

tools = [
    get_weather,
    tavily_search,
]


# ============================================================
# 4. LOCAL OLLAMA MODEL
# ============================================================

llm = ChatOllama(
    model="qwen2.5:1.5b",
    temperature=0,
)

# Allow the model to request registered tools.
llm_with_tools = llm.bind_tools(tools)


# ============================================================
# 5. AGENT INSTRUCTIONS
# ============================================================



SYSTEM_PROMPT = """
You are Roamly, a reliable AI travel assistant.

ACCURACY:
- Use Tavily search for destination research and travel recommendations.
- Recommend only places supported by the search results.
- Never invent locations, distances, opening hours, or facts.
- Do not describe a place as being in Islamabad unless the search results support it.
- If search results are insufficient, clearly say so.

ITINERARIES:
- Follow the number of days requested exactly.
- For each day, use exactly three sections: Morning, Afternoon, and Evening.
- Give one distinct activity in each section.
- Do not repeat attractions unless the user asks.
- Keep the plan practical and specific to the requested destination.

FORMATTING:
- Use valid Markdown.
- Use ## for day headings and **Morning**, **Afternoon**, and **Evening** for time sections.
- Use normal Markdown links: [Place name](https://example.com).
- Never add backslashes to Markdown symbols.
- Do not include unrelated tour advertisements or unnecessary links.
- Answer the user's actual question directly.
"""



# ============================================================
# 6. GRAPH STATE
# ============================================================

class State(TypedDict):
    messages: Annotated[list, add_messages]


# ============================================================
# 7. AGENT NODE
# ============================================================

def agent_node(state: State):

    response = llm_with_tools.invoke(
        [
            SystemMessage(content=SYSTEM_PROMPT),
            *state["messages"],
        ]
    )


    print("MODEL CONTENT:", repr(response.content))
    print("MODEL TOOL CALLS:", response.tool_calls)

    if response.tool_calls:
        print("\n🧠 Agent selected a tool:")

        for tool_call in response.tool_calls:
            print("Tool:", tool_call["name"])
            print("Arguments:", tool_call["args"])

    else:
        print("\n🧠 Agent chose to respond directly.")

    return {
        "messages": [response]
    }


# ============================================================
# 8. BUILD LANGGRAPH
# ============================================================

graph = StateGraph(State)

graph.add_node("agent", agent_node)
graph.add_node("tools", ToolNode(tools))

# START -> AGENT
graph.add_edge(START, "agent")

# Agent decides:
# - tool call -> tools
# - final response -> END
graph.add_conditional_edges(
    "agent",
    tools_condition,
    {
        "tools": "tools",
        END: END,
    },
)
graph.add_edge("tools", "agent")


# ============================================================
# 9. MEMORY AND COMPILATION
# ============================================================


from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
CHECKPOINT_DB = BASE_DIR / "checkpoints.db"

print("Checkpoint database:", CHECKPOINT_DB)

conn = sqlite3.connect(
    str(CHECKPOINT_DB),
    check_same_thread=False,
)

memory = SqliteSaver(conn)
memory.setup()

agent_app = graph.compile(
    checkpointer=memory
)


# ============================================================
# 10. FUNCTION FOR FASTAPI TO CALL
# ============================================================

def chat_with_agent(message: str, conversation_id: int) -> str:
    config = {
        "configurable": {
            "thread_id": str(conversation_id),
        }
    }

    result = agent_app.invoke(
        {
            "messages": [
                HumanMessage(content=message)
            ]
        },
        config=config,
        recursion_limit=15,
    )

    return str(result["messages"][-1].content)
