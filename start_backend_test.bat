@echo off
echo Starting Enterprise Insights Copilot Backend with Llama 3.1 (Ollama)...
cd C:\SAFEVERSION
call conda activate aiproject
echo Note: This project uses only Llama 3.1 via Ollama - no OpenAI dependencies
echo Ensure Ollama service is running with llama3.1 model before starting
uvicorn enterprise_insights_copilot.backend.main:app --reload --host 0.0.0.0 --port 8000
