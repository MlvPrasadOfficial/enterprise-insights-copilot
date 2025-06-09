# Enterprise Insights Copilot - End-to-End Setup Guide

This guide provides step-by-step instructions for setting up and running the Enterprise Insights Copilot project.

## Overview

Enterprise Insights Copilot is a conversational BI platform with the following features:
- Upload CSV files through the UI
- Ask natural language questions about your data
- Generate charts and visualizations automatically
- Run SQL queries through natural language
- Get AI-generated insights about your data
- Multi-agent orchestration for complex queries

## Project Architecture

```
[User] → [Next.js Frontend] → [FastAPI Backend] → [Multi-Agent System] → [LLM/Vector DB]
```

## Prerequisites

- Python 3.9+ with pip
- Node.js 18+ with npm
- OpenAI API key
- Pinecone API key

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/enterprise_insights_copilot.git
cd enterprise_insights_copilot
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in the root directory:

```
OPENAI_API_KEY=your_openai_key_here
PINECONE_API_KEY=your_pinecone_key_here
PINECONE_ENVIRONMENT=your_pinecone_environment
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Running the Application

### Option 1: Using the start scripts

1. Start the backend: Run `start_backend.bat` (Windows) or `./start_backend.sh` (Unix)
2. Start the frontend: Run `start_frontend.bat` (Windows) or `./start_frontend.sh` (Unix)

### Option 2: Manual startup

1. Start the backend:
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

2. Start the frontend:
```bash
cd frontend
npm run dev
```

## Usage

1. Open http://localhost:3000 in your browser
2. Upload a CSV file using the upload component
3. Ask questions about your data using natural language
4. View the generated charts, tables, and insights

# Agent Activity Dashboard

The Enterprise Insights Copilot includes a real-time agent activity dashboard that displays which AI agents are working on your query at any given time. This feature provides transparency into how the multi-agent system processes your questions.

## Using the Agent Dashboard

The agent dashboard appears in the sidebar of the chat interface while agents are working on your query. It shows:

1. **Active Agents**: Which specialized agents are currently working (planner, chart, SQL, insight, etc.)
2. **Status Indicators**: Each agent's current status (working, complete, error)
3. **Agent Messages**: What each agent is doing or has produced
4. **Timeline**: When agents started and completed their tasks

## Agent Types and Functions

The multi-agent system includes these specialized agents:

- **Planning Agent**: Analyzes your query and routes it to the appropriate specialist agent
- **Chart Generator**: Creates visualizations based on your data
- **SQL Query Agent**: Translates natural language to SQL queries and executes them
- **Insight Generator**: Analyzes data to provide statistical summaries and insights
- **Critique Agent**: Reviews outputs to check for errors or inconsistencies
- **Debate Agent**: Explores multiple perspectives for complex analytical questions

## How It Works

When you submit a query, the following happens behind the scenes:

1. The planning agent analyzes your query and determines which specialized agent(s) to invoke
2. Appropriate specialist agents are activated and work on their assigned tasks
3. The agent dashboard displays real-time status updates as agents work
4. When processing completes, you receive your answer along with any generated visualizations or tables

This provides full transparency into the AI reasoning process and helps you understand how your questions are being analyzed and answered.

## Components

### Frontend Components

- **Upload**: Handles file selection and uploading to the backend
- **Chat**: Main interface for asking questions and viewing results
- **ChartPanel**: Displays various chart types based on data
- **AutoInsights**: Shows AI-generated insights about the data

### Backend Components

- **FastAPI Server**: Main entry point and API endpoints
- **Multi-Agent System**: Orchestrates different specialist agents
- **Chart Agent**: Generates visualizations from data
- **SQL Agent**: Converts natural language to SQL
- **Insight Agent**: Analyzes data and generates textual insights

## Examples

Here are some example questions you can ask:

- "What are the sales trends over the last quarter?"
- "Show me a bar chart of revenue by product category"
- "What's the average transaction value by region?"
- "Create a pie chart of customer segments"
- "Identify the top performing products and show insights"

## Troubleshooting

- **CSV Upload Issues**: Check file size (max 10MB) and format
- **Backend Not Starting**: Check Python dependencies and environment variables
- **No Charts Appearing**: Verify data formatting and column types
- **API Connection Errors**: Check frontend .env configuration
