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

    def update(self, df, filename):
        self.df = df
        self.filename = filename
        self.columns = df.columns.tolist()

    def clear(self):
        self.__init__()

    def is_active(self):
        return self.df is not None

    def get(self, user_id):
        return self.memory[user_id]

    def add(self, user_id, message):
        self.memory[user_id].append(message)

memory = SessionMemory()
