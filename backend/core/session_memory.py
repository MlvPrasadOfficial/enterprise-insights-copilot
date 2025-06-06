# core/session_memory.py
from backend.core.logging import logger
from collections import defaultdict

class SessionMemory:
    def __init__(self):
        self.df = None
        self.filename = None
        self.last_query = None
        self.columns = None
        self.memory = defaultdict(list)
        logger.info("[SessionMemory] Initialized.")

    def update(self, df, filename):
        self.df = df
        self.filename = filename
        self.columns = df.columns.tolist()
        logger.info(f"[SessionMemory] Updated with filename: {filename}, shape: {df.shape}")

    def clear(self):
        logger.info("[SessionMemory] Cleared.")
        self.__init__()

    def is_active(self):
        active = self.df is not None
        logger.info(f"[SessionMemory] is_active: {active}")
        return active

    def get(self, user_id):
        logger.info(f"[SessionMemory] get called for user_id: {user_id}")
        return self.memory[user_id]

    def add(self, user_id, message):
        logger.info(f"[SessionMemory] add called for user_id: {user_id}, message: {message}")
        self.memory[user_id].append(message)

memory = SessionMemory()
