import os
from config.constants import *
from dotenv import load_dotenv

load_dotenv()

# Centralized config loader with error handling

def get_env_var(key: str, default=None, required=False, cast_type=None):
    value = os.getenv(key, default)
    if required and value is None:
        raise RuntimeError(f"Missing required environment variable: {key}")
    if cast_type and value is not None:
        try:
            value = cast_type(value)
        except Exception:
            raise ValueError(f"Invalid value for {key}: {value} (expected {cast_type})")
    return value

# Example usage for OpenAI key
OPENAI_API_KEY = get_env_var("OPENAI_API_KEY", required=True)
PINECONE_API_KEY = get_env_var("PINECONE_API_KEY", required=False)
LANGSMITH_API_KEY = get_env_var("LANGSMITH_API_KEY", required=False)

# Add more config as needed
