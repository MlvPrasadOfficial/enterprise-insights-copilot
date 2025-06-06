from langchain.chains.base import Chain
from langchain.chains.llm import LLMChain
from langchain.chains.question_answering import load_qa_chain
from langchain.memory import ConversationBufferMemory
from langchain.prompts.prompt import PromptTemplate
from backend.core.prompts import RAG_PROMPT, INSIGHT_PROMPT, SQL_PROMPT
from backend.core.logging import logger

# Example: a simple QA chain using a prompt and LLM

def create_qa_chain(llm, memory=None) -> Chain:
    chain = LLMChain(
        llm=llm,
        prompt=RAG_PROMPT,
        memory=memory or ConversationBufferMemory(return_messages=True),
        verbose=True,
    )
    logger.info("QA chain created.")
    return chain

# Extend with multi-retriever, FAQ, or other chains as needed
