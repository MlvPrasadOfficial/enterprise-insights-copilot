#!/bin/bash

echo "🚀 Setting up Enterprise Insights Copilot..."

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt

echo "✅ Setup complete. Run backend and frontend:"
echo "cd backend && uvicorn main:app --reload --port 8000"
echo "cd frontend && streamlit run app.py"
