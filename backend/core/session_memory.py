# core/session_memory.py
from backend.core.logging import logger

class SessionMemory:
    def __init__(self):
        self.df = None
        self.filename = None
        self.last_query = None
        self.columns = None

    def update(self, df, filename):
        self.df = df
        self.filename = filename
        self.columns = df.columns.tolist()

    def clear(self):
        self.__init__()

    def is_active(self):
        return self.df is not None

memory = SessionMemory()
