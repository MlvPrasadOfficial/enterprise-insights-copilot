from core.llm_rag import run_rag

class QueryAgent:
    def __init__(self):
        pass

    def analyze(self, user_query: str) -> str:
        # Route to run RAG first
        return run_rag(user_query)
