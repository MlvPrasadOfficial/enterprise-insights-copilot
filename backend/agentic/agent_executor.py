from langchain.agents import initialize_agent, AgentType
from langchain_community.chat_models import ChatOpenAI
from backend.agentic.tools import ask_rag, ask_sql, ask_insight
from backend.core.logging import logger


def get_agent_executor():
    tools = [ask_rag, ask_sql, ask_insight]
    llm = ChatOpenAI(model="gpt-4", temperature=0)
    agent = initialize_agent(
        tools=tools,
        llm=llm,
        agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        verbose=True,
    )
    return agent
