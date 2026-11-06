# Agentic AI Travel Planner

An AI-powered travel planning application built using React, FastAPI, LangGraph, and local Ollama LLMs. The application helps users generate personalized travel plans through natural language conversations.

## Features

- AI-powered travel planning.
- Natural language travel prompts.
- Personalized itinerary generation.
- React-based interactive frontend.
- FastAPI backend.
- LangGraph agent integration.
- User registration and login.
- Conversation and message management.
- Local LLM integration using Ollama.

## Technologies Used

- React
- Tailwind CSS
- Vite
- Python
- FastAPI
- LangGraph
- LangChain
- Ollama
- Qwen 2.5 (1.5B)

## Project Structure

```text
agentic-chat-web/
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── main.py
│   ├── agent.py
│   ├── app.db
│   └── checkpoints.db
│
└── README.md
```

## Local AI Model

This project uses Ollama to run the Qwen 2.5 (1.5B) model locally.

No external LLM API is required for the local model integration.

## Getting Started

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd agentic-chat-web
```

### 2. Start the backend

Navigate to the backend folder and install the project dependencies according to its dependency configuration.

Start FastAPI:

```bash
uv run uvicorn main:app --reload
```

Backend runs at:

`http://127.0.0.1:8000`

### 3. Start the frontend

Navigate to the frontend folder:

```bash
npm install
npm run dev
```

### 4. Start Ollama

Make sure Ollama is installed and running.

Pull the model:

```bash
ollama pull qwen2.5:1.5b
```

## Future Improvements

- Real flight-data API integration.
- Hotel booking integration.
- Advanced itinerary generation.
- Improved AI agent reasoning.
- Maps and travel recommendations.

**Note:** Flight information is not currently connected to a live flight-data provider.

## Author

Developed as a hands-on project exploring Agentic AI, LangGraph, and full-stack AI application development.
