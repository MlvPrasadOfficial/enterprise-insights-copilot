from langgraph.graph import StateGraph, END
from typing import Dict, Any, Tuple, List, Union, Annotated, TypedDict
from backend.core.logging import logger
import pandas as pd
from pydantic import BaseModel, Field
import asyncio
from langchain_core.output_parsers import PydanticOutputParser

# Import the agent status tracking module directly
from backend.core.agent_status import update_agent_status

# Define constants for agent names to avoid duplication
PLANNER_AGENT = "Planning Agent"
CHART_AGENT = "Chart Generator"
SQL_AGENT = "SQL Generator" 
INSIGHT_AGENT = "Insight Generator"
DEBATE_AGENT = "Debate Orchestrator"
CRITIQUE_AGENT = "Critique Evaluator"
ERROR_AGENT = "Error Handler"

# Define structured output models for better type safety and validation
class PlannerOutput(BaseModel):
    next_node: str = Field(description="The next node to route to")
    plan: str = Field(description="Description of the plan")
    confidence: float = Field(description="Confidence in the routing decision", ge=0, le=1)

class ChartOutput(BaseModel):
    chart_spec: dict = Field(description="The chart specification")
    chart_type: str = Field(description="The type of chart")
    x_axis: str = Field(description="X-axis column name")
    y_axis: str = Field(description="Y-axis column name")
    message: str = Field(description="Description of the chart")
    insights: Dict = Field(description="Statistical insights about the chart data")

class SQLOutput(BaseModel):
    sql: str = Field(description="The executed SQL query")
    table_data: List[Dict] = Field(description="The result data as records")
    columns: List[str] = Field(description="Column names in the result")
    message: str = Field(description="Description of the SQL execution")

class InsightOutput(BaseModel):
    insights: str = Field(description="Generated insights from data")
    message: str = Field(description="Description of the insights")

def planner_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Enhanced planner node that makes decisions based on the query
    Returns the state with next_node set, which the conditional router will use
    Uses structured output and more sophisticated routing logic
    """
    session_id = state.get("session_id", "default")
    query = state.get("query", "").lower()
    
    # Update agent status to working
    update_agent_status(
        session_id=session_id,
        agent_name=PLANNER_AGENT,
        status="working",
        agent_type="planner",
        message="Analyzing request and determining best agent"
    )
    
    try:
        # More sophisticated routing logic
        chart_keywords = ["chart", "plot", "graph", "visualization", "trend", "compare", "distribution"]
        sql_keywords = ["sql", "query", "table", "data", "group by", "filter", "rows", "columns", "join", "count"]
        insight_keywords = ["insight", "summary", "analyze", "explain", "statistics", "pattern", "describe", "what can you tell me"]
        debate_keywords = ["debate", "compare options", "weigh", "pros and cons", "multiple perspectives", "evaluate options"]
        
        # Calculate scores for each agent type
        chart_score = sum(1 for word in chart_keywords if word in query)
        sql_score = sum(1 for word in sql_keywords if word in query)
        insight_score = sum(1 for word in insight_keywords if word in query)
        debate_score = sum(1 for word in debate_keywords if word in query)
        
        # Determine highest score with minimum threshold
        max_score = max(chart_score, sql_score, insight_score, debate_score)
        
        if max_score == 0:
            # Default to insight if we can't determine
            next_node = "insight"
            confidence = 0.6
            plan = "No specific keywords detected. Routing to insight agent for general analysis."
        else:
            if debate_score == max_score:
                next_node = "debate"
                confidence = min(0.5 + (debate_score * 0.15), 0.95)
                plan = f"Debate request detected with {debate_score} relevant keywords. Routing to debate agent."
            elif chart_score == max_score:
                next_node = "chart" 
                confidence = min(0.5 + (chart_score * 0.1), 0.95)
                plan = f"Chart-related request detected with {chart_score} relevant keywords. Routing to chart agent."
            elif sql_score == max_score:
                next_node = "sql"
                confidence = min(0.5 + (sql_score * 0.1), 0.95)
                plan = f"SQL/data query detected with {sql_score} relevant keywords. Routing to SQL agent."
            else:
                next_node = "insight"
                confidence = min(0.5 + (insight_score * 0.1), 0.95)
                plan = f"Insight request detected with {insight_score} relevant keywords. Routing to insight agent."
        
        # Update state with structured output
        state["next_node"] = next_node
        state["plan"] = plan
        state["confidence"] = confidence
        state["steps"] = state.get("steps", []) + ["planner"]
        
        # Update agent status
        update_agent_status(
            session_id=session_id,
            agent_name=PLANNER_AGENT,
            status="complete",
            agent_type="planner",
            message=f"Routed query to {next_node} agent with {confidence:.2f} confidence"
        )
        
        # Return the updated state
        return state
        
    except Exception as e:
        logger.error(f"Error in planner_node: {str(e)}")
        
        # Default to insight agent in case of errors
        state["next_node"] = "insight"
        state["plan"] = f"Error in planning: {str(e)}. Defaulting to insight agent."
        state["confidence"] = 0.5
        state["steps"] = state.get("steps", []) + ["planner"]
        state["error"] = str(e)
        
        # Update agent status with error
        update_agent_status(
            session_id=session_id,
            agent_name=PLANNER_AGENT,
            status="error",
            agent_type="planner",
            message=f"Error in planning: {str(e)}. Defaulted to insight agent."
        )
        
        return state

def chart_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Chart generation node that uses the refactored ChartAgent
    """
    session_id = state.get("session_id", "default")
    update_agent_status(
        session_id=session_id,
        agent_name=CHART_AGENT,
        status="working",
        agent_type="chart",
        message="Generating visualization from data"
    )
    
    try:
        from backend.agents.chart_agent import ChartAgent
        from backend.core.session_memory import memory
        
        query = state.get('query', '')
        df = state.get('data') if state.get('data') is not None else memory.df
        
        if isinstance(df, pd.DataFrame) and not df.empty:
            # Initialize agent with standard configuration
            agent = ChartAgent()
            
            # Run the agent with the query and data
            result = agent.run(query, df)
            
            if "error" in result:
                # Handle error case
                state["result"] = result
                update_agent_status(
                    session_id=session_id,
                    agent_name=CHART_AGENT,
                    status="error",
                    agent_type="chart",
                    message=result.get("error", "Unknown error in chart generation")
                )
            else:
                # Extract successful output
                chart_data = result.get("output", {})
                chart_type = chart_data.get("chart_type", "unknown")
                x = chart_data.get("x", "unknown")
                y = chart_data.get("y", "unknown")
                
                state["result"] = {
                    "chart_spec": chart_data.get("spec", {}),
                    "chart_type": chart_type,
                    "x_axis": x,
                    "y_axis": y,
                    "message": f"Generated {chart_type} chart with {x} on x-axis and {y} on y-axis.",
                    "insights": chart_data.get("insights", {}),
                    "metrics": result.get("metrics", {})
                }
                
                update_agent_status(
                    session_id=session_id,
                    agent_name=CHART_AGENT,
                    status="complete",
                    agent_type="chart",
                    message=f"Generated {chart_type} chart with {x} and {y} axes"
                )
        else:
            state["result"] = {"error": "No data available for chart generation."}
            update_agent_status(
                session_id=session_id,
                agent_name=CHART_AGENT,
                status="error",
                agent_type="chart",
                message="No data available for chart generation"
            )
    except Exception as e:
        logger.error(f"Error in chart_node: {str(e)}")
        state["result"] = {"error": f"Failed to generate chart: {str(e)}"}
        update_agent_status(
            session_id=session_id,
            agent_name=CHART_AGENT,
            status="error",
            agent_type="chart",
            message=f"Failed to generate chart: {str(e)}"
        )
    
    state["steps"] = state.get("steps", []) + ["chart"]
    logger.info(f"Chart agent processed query: {state.get('query', '')}")
    return state

def sql_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    SQL generation and execution node that uses the refactored SQLAgent
    """
    session_id = state.get("session_id", "default")
    update_agent_status(
        session_id=session_id,
        agent_name=SQL_AGENT,
        status="working",
        agent_type="sql",
        message="Generating and executing SQL query"
    )
    
    try:
        from backend.agents.sql_agent import SQLAgent
        from backend.core.session_memory import memory
        
        query = state.get('query', '')
        df = state.get('data') if state.get('data') is not None else memory.df
        
        if isinstance(df, pd.DataFrame) and not df.empty:
            # Initialize agent with standard configuration
            agent = SQLAgent()
            
            # Run the agent with the query and data
            result = agent.run(query, df)
            
            if "error" in result or (isinstance(result.get("output", {}), dict) and "sql_error" in result.get("output", {})):
                # Handle error case
                error_msg = result.get("error", result.get("output", {}).get("sql_error", "Unknown SQL error"))
                state["result"] = {
                    "error": error_msg,
                    "available_columns": list(df.columns)
                }
                update_agent_status(
                    session_id=session_id,
                    agent_name=SQL_AGENT,
                    status="error",
                    agent_type="sql",
                    message=f"SQL error: {error_msg}"
                )
            else:
                # Extract successful output
                sql_data = result.get("output", {})
                sql_query = sql_data.get("sql_query", "SELECT * FROM df")
                records = sql_data.get("result", [])
                
                state["result"] = {
                    "sql": sql_query,
                    "table_data": records,
                    "columns": list(df.columns),
                    "message": f"Executed SQL query with {len(records)} results",
                    "metrics": result.get("metrics", {})
                }
                
                update_agent_status(
                    session_id=session_id,
                    agent_name=SQL_AGENT,
                    status="complete",
                    agent_type="sql",
                    message=f"Generated and executed SQL query with {len(records)} results"
                )
        else:
            state["result"] = {"error": "No data available for SQL query."}
            update_agent_status(
                session_id=session_id,
                agent_name=SQL_AGENT,
                status="error",
                agent_type="sql",
                message="No data available for SQL query"
            )
    except Exception as e:
        logger.error(f"Error in sql_node: {str(e)}")
        state["result"] = {"error": f"Failed to execute SQL: {str(e)}"}
        update_agent_status(
            session_id=session_id,
            agent_name=SQL_AGENT,
            status="error",
            agent_type="sql",
            message=f"Failed to execute SQL: {str(e)}"
        )
    
    state["steps"] = state.get("steps", []) + ["sql"]
    logger.info(f"SQL agent processed query: {state.get('query', '')}")
    return state

def insight_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Insight generation node that uses the refactored InsightAgent
    """
    session_id = state.get("session_id", "default")
    update_agent_status(
        session_id=session_id,
        agent_name=INSIGHT_AGENT,
        status="working",
        agent_type="insight",
        message="Analyzing data and generating insights"
    )
    
    try:
        from backend.agents.insight_agent import InsightAgent
        from backend.core.session_memory import memory
        
        query = state.get('query', '')
        df = state.get('data') if state.get('data') is not None else memory.df
        
        if isinstance(df, pd.DataFrame) and not df.empty:
            # Initialize agent with standard configuration
            agent = InsightAgent()
            
            # Run the agent with the query and data
            result = agent.run(query, df)
            
            if "error" in result:
                # Handle error case
                state["result"] = result
                update_agent_status(
                    session_id=session_id,
                    agent_name=INSIGHT_AGENT,
                    status="error",
                    agent_type="insight",
                    message=result.get("error", "Unknown error in insight generation")
                )
            else:
                # Extract successful output
                insight_data = result.get("output", {})
                insights = insight_data.get("insights", "No insights generated")
                key_findings = insight_data.get("key_findings", [])
                
                state["result"] = {
                    "insights": insights,
                    "key_findings": key_findings,
                    "data_profile": insight_data.get("data_profile", {}),
                    "message": "Generated insights from data analysis",
                    "metrics": result.get("metrics", {})
                }
                
                update_agent_status(
                    session_id=session_id,
                    agent_name=INSIGHT_AGENT,
                    status="complete",
                    agent_type="insight",
                    message=f"Generated insights with {len(key_findings)} key findings"
                )
        else:
            state["result"] = {"error": "No data available for insight generation."}
            update_agent_status(
                session_id=session_id,
                agent_name=INSIGHT_AGENT,
                status="error",
                agent_type="insight",
                message="No data available for insight generation"
            )
    except Exception as e:
        logger.error(f"Error in insight_node: {str(e)}")
        state["result"] = {"error": f"Failed to generate insights: {str(e)}"}
        update_agent_status(
            session_id=session_id,
            agent_name=INSIGHT_AGENT,
            status="error",
            agent_type="insight",
            message=f"Failed to generate insights: {str(e)}"
        )
    
    state["steps"] = state.get("steps", []) + ["insight"]
    logger.info(f"Insight agent processed query: {state.get('query', '')}")
    return state

def debate_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Debate node that orchestrates a multi-agent debate using the refactored DebateAgent
    """
    session_id = state.get("session_id", "default")
    update_agent_status(
        session_id=session_id,
        agent_name=DEBATE_AGENT,
        status="working",
        agent_type="debate",
        message="Starting multi-agent debate to analyze from different perspectives"
    )
    
    try:
        from backend.agents.debate_agent import DebateAgent
        from backend.core.session_memory import memory
        
        query = state.get('query', '')
        df = state.get('data') if state.get('data') is not None else memory.df
        
        if isinstance(df, pd.DataFrame) and not df.empty:
            # Initialize debate agent
            agent = DebateAgent()
            
            # Run the agent with the query and data
            result = agent.run(query, df)
            
            if "error" in result:
                # Handle error case
                state["result"] = result
                update_agent_status(
                    session_id=session_id,
                    agent_name=DEBATE_AGENT,
                    status="error",
                    agent_type="debate",
                    message=result.get("error", "Unknown error in debate process")
                )
            else:
                # Extract successful output
                debate_data = result.get("output", {})
                responses = debate_data.get("responses", {})
                evaluations = debate_data.get("evaluations", {})
                decision = debate_data.get("decision", {})
                
                # Parse decision if it's a string (JSON)
                if isinstance(decision, str):
                    try:
                        import json
                        decision = json.loads(decision)
                    except json.JSONDecodeError:
                        logger.error("Could not parse debate decision JSON")
                        decision = {"winner": "None", "reason": "Error parsing decision"}
                
                state["result"] = {
                    "winner": decision.get("winner", "None"),
                    "reason": decision.get("reason", "No clear winner determined"),
                    "responses": responses,
                    "evaluations": evaluations,
                    "message": f"Completed debate with {len(responses)} perspectives",
                    "metrics": result.get("metrics", {})
                }
                
                update_agent_status(
                    session_id=session_id,
                    agent_name=DEBATE_AGENT,
                    status="complete",
                    agent_type="debate",
                    message=f"Completed debate, winner: {decision.get('winner', 'None')}"
                )
        else:
            state["result"] = {"error": "No data available for debate."}
            update_agent_status(
                session_id=session_id,
                agent_name=DEBATE_AGENT,
                status="error",
                agent_type="debate",
                message="No data available for debate analysis"
            )
    except Exception as e:
        logger.error(f"Error in debate_node: {str(e)}")
        state["result"] = {"error": f"Failed to complete debate: {str(e)}"}
        update_agent_status(
            session_id=session_id,
            agent_name=DEBATE_AGENT,
            status="error",
            agent_type="debate",
            message=f"Failed to complete debate: {str(e)}"
        )
    
    state["steps"] = state.get("steps", []) + ["debate"]
    logger.info(f"Debate agent processed query: {state.get('query', '')}")
    return state

def critique_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Critique node that evaluates response quality using the refactored CritiqueAgent
    """
    session_id = state.get("session_id", "default")
    update_agent_status(
        session_id=session_id,
        agent_name=CRITIQUE_AGENT,
        status="working",
        agent_type="critique",
        message="Evaluating response quality and checking for hallucinations"
    )
    
    try:
        from backend.agents.critique_agent import CritiqueAgent
        from backend.core.session_memory import memory
        
        query = state.get('query', '')
        df = state.get('data') if state.get('data') is not None else memory.df
        result = state.get('result', {})
        
        if not result:
            state["critique"] = {"error": "No result to evaluate"}
            update_agent_status(
                session_id=session_id,
                agent_name=CRITIQUE_AGENT,
                status="error",
                agent_type="critique",
                message="No result to evaluate"
            )
            return state
            
        # Extract answer from result based on the previous agent
        answer = None
        if "insights" in result:
            answer = result.get("insights", "")
        elif "table_data" in result:
            # For SQL results, convert to string
            import pandas as pd
            if result.get("table_data"):
                df_result = pd.DataFrame(result.get("table_data", []))
                answer = df_result.to_markdown() if not df_result.empty else "No results"
            else:
                answer = "No SQL results"
        elif "message" in result:
            answer = result.get("message", "")
            
        if not answer:
            answer = str(result)
            
        # Initialize critique agent
        agent = CritiqueAgent()
        
        # Run critique with the query, data, and answer
        critique_result = agent.run(query, df, answer=answer)
        
        if "error" in critique_result:
            state["critique"] = critique_result
        else:
            # Extract critique output
            evaluation = critique_result.get("output", {})
            confidence = evaluation.get("confidence", "Low")
            flagged = evaluation.get("flagged", False)
            issues = evaluation.get("issues", [])
            
            state["critique"] = {
                "confidence": confidence,
                "flagged": flagged,
                "issues": issues,
                "advice": evaluation.get("advice", ""),
                "metrics": critique_result.get("metrics", {})
            }
            
            # If flagged with low confidence, add warning to the result
            if flagged and confidence.lower() == "low":
                if "warning" not in state["result"]:
                    state["result"]["warning"] = "This response may contain inaccuracies."
                    
                if issues:
                    state["result"]["issues"] = issues
                    
        update_agent_status(
            session_id=session_id,
            agent_name=CRITIQUE_AGENT,
            status="complete",
            agent_type="critique",
            message=f"Evaluated response with confidence: {state['critique'].get('confidence', 'Unknown')}"
        )
                
    except Exception as e:
        logger.error(f"Error in critique_node: {str(e)}")
        state["critique"] = {"error": f"Failed to evaluate response: {str(e)}"}
        update_agent_status(
            session_id=session_id,
            agent_name=CRITIQUE_AGENT,
            status="error", 
            agent_type="critique",
            message=f"Failed to evaluate response: {str(e)}"
        )
    
    state["steps"] = state.get("steps", []) + ["critique"]
    return state

def error_handler_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Handle errors gracefully and provide fallback responses
    """
    session_id = state.get("session_id", "default")
    query = state.get("query", "")
    error = state.get("error", "Unknown error")
    
    logger.error(f"Error handler triggered: {error}")
    
    # Update agent status
    update_agent_status(
        session_id=session_id,
        agent_name=ERROR_AGENT,
        status="working",
        agent_type="error",
        message=f"Handling error: {error}"
    )
    
    # Provide a fallback response
    state["result"] = {
        "error": str(error),
        "fallback_message": "I encountered an issue processing your request. Here's a basic analysis instead.",
        "original_query": query
    }
    
    # Try to provide some basic information about the data
    try:
        from backend.core.session_memory import memory
        df = state.get('data') if state.get('data') is not None else memory.df
        if isinstance(df, pd.DataFrame) and not df.empty:
            basic_info = {
                "rows": len(df),
                "columns": list(df.columns),
                "sample": df.head(3).to_dict(orient="records")
            }
            state["result"]["basic_data_info"] = basic_info
    except Exception as e:
        logger.error(f"Error providing fallback data info: {str(e)}")
    
    # Update agent status
    update_agent_status(
        session_id=session_id,
        agent_name=ERROR_AGENT,
        status="complete",
        agent_type="error",
        message="Provided fallback response"
    )
    
    return state

def build_multiagent_graph():
    """
    Build an enhanced multi-agent graph with parallel processing capabilities,
    quality evaluation, and better error handling
    """
    # Create a state graph with dictionary state
    graph = StateGraph(dict)
    
    # Add our nodes
    graph.add_node("planner", planner_node)
    graph.add_node("chart", chart_node)
    graph.add_node("sql", sql_node)
    graph.add_node("insight", insight_node)
    graph.add_node("debate", debate_node)
    graph.add_node("critique", critique_node)
    graph.add_node("error_handler", error_handler_node)
    
    # Set entry point
    graph.set_entry_point("planner")
    
    # Add conditional edges from planner based on the planner's decision
    graph.add_conditional_edges(
        "planner",
        # This function routes based on the next_node key set by the planner
        lambda state: state.get("next_node", "insight"),  # Default to insight if not set
        {
            "chart": "chart",
            "sql": "sql",
            "insight": "insight",
            "debate": "debate",
            "error": "error_handler"  # Add route to error handler
        }
    )
    
    # Add edges to critique for quality evaluation
    graph.add_edge("chart", "critique")
    graph.add_edge("sql", "critique")
    graph.add_edge("insight", "critique")
    graph.add_edge("debate", "critique")
    
    # Add edge from critique to END
    graph.add_edge("critique", END)
    graph.add_edge("error_handler", END)
    
    # Compile the graph
    return graph.compile()

# Build the graph once at module level
multiagent_flow = build_multiagent_graph()

async def run_multiagent_flow_async(query, data=None, session_id="default"):
    """
    Asynchronous version of the multiagent flow for better performance
    
    Args:
        query (str): The user's query
        data (Any, optional): Data to process (e.g., DataFrame)
        session_id (str, optional): Session identifier for tracking agent status
        
    Returns:
        Dict: Results from the agent flow including steps and result
    """
    try:
        logger.info(f"Starting async multiagent flow with query: {query}")
        
        # Initialize the state
        initial_state = {
            "query": query,
            "data": data,
            "result": "",
            "steps": [],
            "history": [],
            "session_id": session_id,
            "start_time": pd.Timestamp.now()
        }
        
        # Add tracing context
        from backend.core.tracing import log_langsmith_event
        log_langsmith_event(
            event_type="flow_start",
            data={"query": query, "session_id": session_id},
            tags=["multiagent_flow"],
            name="multiagent_flow_start"
        )
        
        # Invoke the graph with the initial state
        result = await asyncio.to_thread(multiagent_flow.invoke, initial_state)
        
        # Calculate execution time
        execution_time = (pd.Timestamp.now() - result.get("start_time", pd.Timestamp.now())).total_seconds()
        logger.info(f"Completed multiagent flow in {execution_time:.2f} seconds. Steps: {result.get('steps', [])}")
        
        # Add tracing for completion
        log_langsmith_event(
            event_type="flow_complete",
            data={
                "query": query,
                "session_id": session_id,
                "steps": result.get('steps', []),
                "execution_time": execution_time
            },
            tags=["multiagent_flow"],
            name="multiagent_flow_complete"
        )
        
        return {
            "status": "success", 
            "result": result.get("result", ""),
            "steps": result.get("steps", []),
            "execution_time": execution_time
        }
    except Exception as e:
        logger.error(f"Error in async multiagent flow: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        
        # Log error to LangSmith
        from backend.core.tracing import log_error_event
        log_error_event(
            query=query,
            context={"session_id": session_id},
            trace=[],
            error=e,
            tags=["multiagent_flow", "error"]
        )
        
        return {"status": "error", "message": str(e)}

def run_multiagent_flow(query, data=None, session_id="default"):
    """
    Run the multiagent flow with the given query and data
    This is a synchronous wrapper around the async function for backward compatibility
    
    Args:
        query (str): The user's query
        data (Any, optional): Data to process (e.g., DataFrame)
        session_id (str, optional): Session identifier for tracking agent status
        
    Returns:
        Dict: Results from the agent flow including steps and result
    """
    try:
        import asyncio
        try:
            # Try to get the current event loop - will work in async contexts
            loop = asyncio.get_event_loop()
        except RuntimeError:
            # If there's no event loop, create a new one - for synchronous contexts
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
        return loop.run_until_complete(run_multiagent_flow_async(query, data, session_id))
    except Exception as e:
        logger.error(f"Error in multiagent flow sync wrapper: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return {"status": "error", "message": str(e)}