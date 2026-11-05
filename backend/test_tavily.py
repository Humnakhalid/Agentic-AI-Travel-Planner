
from pathlib import Path
from dotenv import load_dotenv
from langchain_tavily import TavilySearch

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

tavily = TavilySearch(
    max_results=5,
    topic="general",
    search_depth="advanced",
    include_answer=True,
    include_raw_content=False,
)

query = (
    "Official current 2026 visitor information for Istanbul: "
    "Hagia Sophia entrance fee, Grand Bazaar admission, "
    "Topkapi Palace ticket prices. Include source URLs."
)

try:
    results = tavily.invoke({"query": query})

    print("\n========== TAVILY ANSWER ==========")
    print(results.get("answer"))

    print("\n========== SEARCH RESULTS ==========")
    for i, result in enumerate(results.get("results", []), start=1):
        print(f"\n--- Result {i} ---")
        print("Title:", result.get("title"))
        print("URL:", result.get("url"))
        print("Content:", result.get("content"))
        print("Raw content:", result.get("raw_content"))

except Exception as exc:
    print("TAVILY TEST FAILED")
    print(type(exc).__name__, str(exc))
