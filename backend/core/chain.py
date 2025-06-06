"""
Chain utilities for orchestrating LLM, knowledge base, and FAQ retrieval in multi-agent pipelines.
"""

from typing import Any, Optional, List, Dict
from langchain.chains.base import Chain
from langchain.chains.llm import LLMChain
from langchain.chains.question_answering import load_qa_chain
from langchain.memory import ConversationBufferMemory
from langchain.prompts.prompt import PromptTemplate
from backend.core.prompts import RAG_PROMPT, INSIGHT_PROMPT, SQL_PROMPT
from backend.core.logging import logger
from langchain.chains.combine_documents.base import BaseCombineDocumentsChain
from langchain.schema.vectorstore import VectorStore
from langchain.schema import BaseRetriever
from pydantic import PrivateAttr


def create_qa_chain(llm: Any, memory: Optional[Any] = None) -> Chain:
    """
    Create a simple QA chain using an LLM and a prompt.
    Args:
        llm (Any): The language model to use.
        memory (Optional[Any]): Optional conversation memory.
    Returns:
        Chain: Configured QA chain.
    """
    logger.info("[chain] create_qa_chain called.")
    chain = LLMChain(
        llm=llm,
        prompt=RAG_PROMPT,
        memory=memory or ConversationBufferMemory(return_messages=True),
        verbose=True,
    )
    logger.info("[chain] QA chain created.")
    return chain


class MultiRetrieverFAQChain(Chain):
    """
    Chain that orchestrates multi-retriever (knowledge base + FAQ) and streaming responses.
    """

    _llm: Any = PrivateAttr()
    _knowledge_base_retrievers: list = PrivateAttr()
    _smart_faq_retriever: Any = PrivateAttr()
    _memory: Any = PrivateAttr()
    _verbose: bool = PrivateAttr()
    _qa_chain: Any = PrivateAttr()

    class Config:
        arbitrary_types_allowed = True
        extra = "allow"

    def __init__(
        self,
        llm: Any,
        knowledge_base_retrievers: list,
        smart_faq_retriever: Any = None,
        memory: Any = None,
        verbose: bool = True,
    ):
        logger.info("[chain] MultiRetrieverFAQChain initialized.")
        super().__init__()
        self._llm = llm
        self._knowledge_base_retrievers = knowledge_base_retrievers
        self._smart_faq_retriever = smart_faq_retriever
        self._memory = memory or ConversationBufferMemory(return_messages=True)
        self._verbose = verbose
        self._qa_chain = LLMChain(
            llm=llm, prompt=RAG_PROMPT, memory=self._memory, verbose=verbose
        )

    def _call(
        self, inputs: Dict[str, Any], run_manager: Optional[Any] = None
    ) -> Dict[str, str]:
        """
        Run the multi-retriever chain for a given question.
        Args:
            inputs (Dict[str, Any]): Input dictionary with "question" key.
            run_manager (Optional[Any]): Optional run manager.
        Returns:
            Dict[str, str]: Dictionary with "answer" key.
        """
        question = inputs["question"]
        logger.info(f"[chain] MultiRetrieverFAQChain _call with question: {question}")
        answer = ""
        # FAQ retrieval
        if self._smart_faq_retriever:
            docs = self._smart_faq_retriever.get_relevant_documents(question)
            if docs:
                logger.info(f"[chain] FAQ docs found: {len(docs)}")
                answer += "\n#### SMART FAQ ANSWER\n" + "\n".join(
                    [d.page_content for d in docs]
                )
        # Knowledge base retrieval
        for retriever in self._knowledge_base_retrievers:
            docs = retriever.get_relevant_documents(question)
            if docs:
                logger.info(f"[chain] KB docs found: {len(docs)}")
                answer += "\n#### KNOWLEDGE BASE ANSWER\n" + "\n".join(
                    [d.page_content for d in docs]
                )
        # LLM answer
        answer += "\n#### LLM ANSWER\n" + self._qa_chain.run(question=question)
        logger.info("[chain] MultiRetrieverFAQChain _call completed.")
        return {"answer": answer}

    @property
    def input_keys(self) -> List[str]:
        return ["question"]

    @property
    def output_keys(self) -> List[str]:
        return ["answer"]


def create_multi_chain(
    llm: Any,
    knowledge_base_retrievers: List[Any],
    smart_faq_retriever: Optional[Any] = None,
    memory: Optional[Any] = None,
    verbose: bool = True,
) -> MultiRetrieverFAQChain:
    """
    Create a MultiRetrieverFAQChain for multi-retriever orchestration.
    Args:
        llm (Any): The language model to use.
        knowledge_base_retrievers (List[Any]): List of retrievers for knowledge bases.
        smart_faq_retriever (Optional[Any]): Retriever for smart FAQ.
        memory (Optional[Any]): Conversation memory.
        verbose (bool): Verbosity flag.
    Returns:
        MultiRetrieverFAQChain: Configured multi-retriever chain.
    """
    logger.info("[chain] create_multi_chain called.")
    return MultiRetrieverFAQChain(
        llm, knowledge_base_retrievers, smart_faq_retriever, memory, verbose
    )


# Extend with multi-retriever, FAQ, or other chains as needed
