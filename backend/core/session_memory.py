"""
SessionMemory: Stores session-level DataFrame, filename, and per-user chat memory for the backend.
"""

from typing import Any, Optional
from collections import defaultdict
from backend.core.logging import logger

class SessionMemory:
    def __init__(self):
        """
        Initialize SessionMemory with empty DataFrame and memory store.
        """
        self.df: Optional[Any] = None
        self.filename: Optional[str] = None
        self.last_query: Optional[str] = None
        self.columns: Optional[list[str]] = None
        self.memory = defaultdict(list)
        logger.info("[SessionMemory] Initialized.")

    def update(self, df: Any, filename: str) -> None:
        """
        Update the session with a new DataFrame and filename.
        Args:
            df (Any): The DataFrame to store.
            filename (str): The filename associated with the DataFrame.
        """
        self.df = df
        self.filename = filename
        self.columns = df.columns.tolist()
        logger.info(f"[SessionMemory] Updated with filename: {filename}, shape: {df.shape}")

    def clear(self) -> None:
        """
        Clear the session memory and reset all fields.
        """
        logger.info("[SessionMemory] Cleared.")
        self.__init__()

    def is_active(self) -> bool:
        """
        Check if a DataFrame is loaded in the session.
        Returns:
            bool: True if a DataFrame is loaded, else False.
        """
        active = self.df is not None
        logger.info(f"[SessionMemory] is_active: {active}")
        return active

    def get(self, user_id: str) -> list[Any]:
        """
        Get the chat memory for a user.
        Args:
            user_id (str): The user ID.
        Returns:
            list[Any]: The user's chat memory.
        """
        logger.info(f"[SessionMemory] get called for user_id: {user_id}")
        return self.memory[user_id]

    def add(self, user_id: str, message: Any) -> None:
        """
        Add a message to a user's chat memory.
        Args:
            user_id (str): The user ID.
            message (Any): The message to add.
        """
        logger.info(f"[SessionMemory] add called for user_id: {user_id}, message: {message}")
        self.memory[user_id].append(message)

memory = SessionMemory()
