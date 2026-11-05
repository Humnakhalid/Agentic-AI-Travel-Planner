
from agent import chat_with_agent

response = chat_with_agent(
    message=(
        "Plan a 3-day trip to Lahore, Pakistan. "
        "Find popular attractions and check the current weather."
    ),
    conversation_id=999,
)

print("\n===== FINAL AGENT ANSWER =====\n")
print(response)
