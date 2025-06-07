"""
Debate mode: Two LLM agents debate, a judge picks the best answer.
"""
def debate_mode(query, docs=None):
    # TODO: Use two LLMs and a judge LLM
    agent_a = f"AgentA answer for: {query}"
    agent_b = f"AgentB answer for: {query}"
    judge = f"Judge: AgentA vs AgentB for '{query}' -- AgentA wins"
    return {"AgentA": agent_a, "AgentB": agent_b, "Judge": judge}
