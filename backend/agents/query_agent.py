"""
QueryAgent: Simple agent to route user queries to RAG pipeline.
"""

from backend.core.llm_rag import run_rag
from backend.core.logging import logger
from typing import Any


class QueryAgent:
    def __init__(self):
        """
        Initialize QueryAgent.
        """
        pass

    def analyze(self, user_query: str) -> str:
        """
        Analyze a user query using the RAG pipeline.

        Args:
            user_query (str): The user's question in natural language.

        Returns:
            str: The answer from the RAG pipeline.
        """
        logger.info(f"[QueryAgent] analyze called with user_query: {user_query}")
        # Route to run RAG first
        return run_rag(user_query)

    @staticmethod
    def retrieve(user_query: str, data: any) -> any:
        """
        Retrieve context for the agentic flow (stub for now).

        Args:
            user_query (str): The user's question.
            data (Any): The data to search.

        Returns:
            Any: Retrieved context (stubbed as None).
        """
        # TODO: Implement real retrieval logic (e.g., RAG, semantic search)
        return None
