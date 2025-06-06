"""
Model configuration, OpenAI client, and tokenizer utilities for backend LLM and embedding support.
"""

from dataclasses import dataclass
from typing import Any, Optional
import os
import tiktoken
from openai import OpenAI
from config.constants import OPENAI_EMBEDDING_MODEL
from backend.core.logging import logger


@dataclass
class ModelConfig:
    name: str
    embedding: str
    context: int


class MODELS:
    GPT4: ModelConfig = ModelConfig(
        name="gpt-4",
        embedding=OPENAI_EMBEDDING_MODEL,
        context=8192,
    )
    GPT35TURBO: ModelConfig = ModelConfig(
        name="gpt-3.5-turbo",
        embedding=OPENAI_EMBEDDING_MODEL,
        context=4096,
    )
    # Add more models as needed


class EMBEDDINGS:
    OPENAI: str = OPENAI_EMBEDDING_MODEL
    # Add HuggingFace or other embeddings as needed


def get_openai_client(api_key: Optional[str] = None) -> OpenAI:
    """
    Get an OpenAI client instance using the provided or environment API key.
    Args:
        api_key (Optional[str]): OpenAI API key. If None, uses environment variable.
    Returns:
        OpenAI: OpenAI client instance.
    Raises:
        RuntimeError: If API key is not set.
    """
    api_key = api_key or os.getenv("OPENAI_API_KEY")
    if not api_key:
        logger.error("OPENAI_API_KEY not set!")
        raise RuntimeError("OPENAI_API_KEY not set!")
    logger.info("[models] OpenAI client created.")
    return OpenAI(api_key=api_key)


def get_tokenizer(model_name: str = OPENAI_EMBEDDING_MODEL) -> Any:
    """
    Get a tokenizer for the specified model.
    Args:
        model_name (str): Name of the model for tokenizer.
    Returns:
        Any: Tokenizer instance.
    Raises:
        Exception: If tokenizer cannot be found.
    """
    try:
        logger.info(f"[models] get_tokenizer called for model: {model_name}")
        return tiktoken.encoding_for_model(model_name)
    except Exception as e:
        logger.error(f"Tokenizer for {model_name} not found: {e}")
        raise
