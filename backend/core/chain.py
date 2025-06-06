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

# Example: a simple QA chain using a prompt and LLM

def create_qa_chain(llm, memory=None) -> Chain:
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
    """Chain that orchestrates multi-retriever (knowledge base + FAQ) and streaming responses."""
    def __init__(self, llm, knowledge_base_retrievers, smart_faq_retriever=None, memory=None, verbose=True):
        logger.info("[chain] MultiRetrieverFAQChain initialized.")
        self.llm = llm
        self.knowledge_base_retrievers = knowledge_base_retrievers
        self.smart_faq_retriever = smart_faq_retriever
        self.memory = memory or ConversationBufferMemory(return_messages=True)
        self.verbose = verbose
        self.qa_chain = LLMChain(llm=llm, prompt=RAG_PROMPT, memory=self.memory, verbose=verbose)

    def _call(self, inputs: dict, run_manager=None):
        question = inputs["question"]
        logger.info(f"[chain] MultiRetrieverFAQChain _call with question: {question}")
        answer = ""
        # FAQ retrieval
        if self.smart_faq_retriever:
            docs = self.smart_faq_retriever.get_relevant_documents(question)
            if docs:
                logger.info(f"[chain] FAQ docs found: {len(docs)}")
                answer += "\n#### SMART FAQ ANSWER\n" + "\n".join([d.page_content for d in docs])
        # Knowledge base retrieval
        for retriever in self.knowledge_base_retrievers:
            docs = retriever.get_relevant_documents(question)
            if docs:
                logger.info(f"[chain] KB docs found: {len(docs)}")
                answer += "\n#### KNOWLEDGE BASE ANSWER\n" + "\n".join([d.page_content for d in docs])
        # LLM answer
        answer += "\n#### LLM ANSWER\n" + self.qa_chain.run(question=question)
        logger.info("[chain] MultiRetrieverFAQChain _call completed.")
        return {"answer": answer}

    @property
    def input_keys(self):
        return ["question"]

    @property
    def output_keys(self):
        return ["answer"]

def create_multi_chain(llm, knowledge_base_retrievers, smart_faq_retriever=None, memory=None, verbose=True):
    logger.info("[chain] create_multi_chain called.")
    return MultiRetrieverFAQChain(llm, knowledge_base_retrievers, smart_faq_retriever, memory, verbose)

# Extend with multi-retriever, FAQ, or other chains as needed
