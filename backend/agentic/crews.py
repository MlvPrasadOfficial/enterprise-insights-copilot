"""
CrewAI multi-agent crew and task definitions.
"""
from crewai import Agent, Crew, Task

planner = Agent(role="Planner", goal="Breakdown complex query")
retriever = Agent(role="Retriever", goal="Fetch info")
analyst = Agent(role="Analyst", goal="Analyze data")
critic = Agent(role="Critic", goal="Review output")

tasks = [
    Task("Plan and decompose query", planner),
    Task("Retrieve relevant docs", retriever),
    Task("Analyze and synthesize insights", analyst),
    Task("Review and flag issues", critic)
]

my_crew = Crew(tasks)
