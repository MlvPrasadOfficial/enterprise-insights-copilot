from langchain.prompts.prompt import PromptTemplate
import os
import logging

PROMPT_DIR = os.path.join(os.path.dirname(__file__), "../../config/prompts")
logger = logging.getLogger(__name__)


def load_prompt(filename: str) -> str:
    logger.info(f"[prompts] load_prompt called with filename: {filename}")
    path = os.path.join(PROMPT_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    logger.info(f"[prompts] Loaded prompt from {path}")
    return content


# Example: load and wrap as PromptTemplate
RAG_PROMPT = PromptTemplate(
    template=load_prompt("rag_prompt.txt"), input_variables=["context", "query"]
)
INSIGHT_PROMPT = PromptTemplate(
    template=load_prompt("insight_prompt.txt"), input_variables=["profile"]
)
SQL_PROMPT = PromptTemplate(
    template=load_prompt("sql_prompt.txt"), input_variables=["schema", "query"]
)
