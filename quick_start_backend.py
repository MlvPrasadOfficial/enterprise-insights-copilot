#!/usr/bin/env python3
"""Quick backend starter script"""

import os
import sys

import sys

# Note: This project now uses only Llama 3.1 via Ollama - no OpenAI dependencies required
# Environment variables for OpenAI have been removed as they are no longer needed

# Ensure OpenAI keys are cleared if accidentally set
if os.environ.get('OPENAI_API_KEY'):
    del os.environ['OPENAI_API_KEY']
    print("Removed OpenAI API key - using Llama 3.1 only")

print("Starting backend with Llama 3.1 (Ollama) - no OpenAI dependencies")

# Change to parent directory (SAFEVERSION)
os.chdir('C:\\SAFEVERSION')

# Import and run uvicorn
try:
    import uvicorn
    print("Starting backend server...")
    uvicorn.run("enterprise_insights_copilot.backend.main:app", host="0.0.0.0", port=8000, reload=True)
except Exception as e:
    print(f"Error starting backend: {e}")
    sys.exit(1)
