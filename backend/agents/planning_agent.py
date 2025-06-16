"""
PlanningAgent: Advanced routing and planning with context-awareness, 
query decomposition, and adaptive learning from past execution.
"""

from backend.agents.base_agent import BaseAgent, AgentConfig, CachePolicy
from backend.core.logging import logger
from typing import Dict, Any, List, Optional, Tuple, Union
import json
import pandas as pd
import numpy as np
from pydantic import BaseModel, Field
from datetime import datetime
import uuid
import re
from enum import Enum
import pickle
import os
from collections import defaultdict

class RoutingStrategy(str, Enum):
    """Available routing strategies for the PlanningAgent"""
    KEYWORD = "keyword"           # Simple keyword-based routing
    SEMANTIC = "semantic"         # Embedding-based semantic matching
    HYBRID = "hybrid"            # Combination of keyword and semantic
    ADAPTIVE = "adaptive"        # Learns from past routing decisions
    HIERARCHICAL = "hierarchical" # Decomposes complex queries


class PlanningConfig(AgentConfig):
    """Enhanced configuration for planning agent"""
    strategy: RoutingStrategy = Field(default=RoutingStrategy.HYBRID)
    use_learning: bool = Field(default=True, description="Whether to learn from past routing decisions")
    decompose_complex_queries: bool = Field(default=True, description="Whether to break down complex queries")
    fallback_agent: str = Field(default="insight", description="Default agent if routing fails")
    min_confidence_threshold: float = Field(default=0.6, description="Minimum confidence for routing")
    consider_data_state: bool = Field(default=True, description="Whether to consider available data when planning")
    max_plan_history: int = Field(default=100, description="Maximum plan history to maintain")
    workload_balancing: bool = Field(default=False, description="Enable workload balancing across agents")


class SubQuery(BaseModel):
    """Decomposed part of a complex query"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str
    intent: str
    agent: str
    confidence: float
    order: int
    depends_on: List[str] = Field(default_factory=list)


class RoutingFeedback(BaseModel):
    """Feedback on routing decisions for learning"""
    query_id: str
    query: str
    routed_agent: str
    actual_agent: Optional[str] = None  # If known which agent would have been better
    was_successful: bool
    error_message: Optional[str] = None
    execution_time: float
    timestamp: datetime = Field(default_factory=datetime.now)


class PlanningOutcome(BaseModel):
    """Complete planning outcome for a query"""
    query_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    query: str
    primary_agent: str
    confidence: float
    sub_queries: List[SubQuery] = Field(default_factory=list)
    requires_data: bool
    expected_execution_time: float
    timestamp: datetime = Field(default_factory=datetime.now)
    domain: Optional[str] = None
    

class AgentProfile(BaseModel):
    """Profile of an agent's capabilities and performance"""
    name: str
    role: str
    avg_execution_time: float = 0.0
    success_rate: float = 1.0
    specialties: List[str] = Field(default_factory=list)
    required_inputs: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    call_count: int = 0
    last_called: Optional[datetime] = None


class PlanningAgent(BaseAgent):
    name = "PlanningAgent"
    role = "Routes queries to optimal agents and plans execution flows"
    
    def __init__(self, config=None):
        """
        Initialize PlanningAgent with configuration.

        Args:
            config: Optional configuration dictionary.
        """
        # Set default configuration for planning agent
        default_config = {
            "temperature": 0.2,  # Lower for more deterministic planning
            "model": "gpt-4",    # More capable model for planning
            "cache_policy": CachePolicy.QUERY,  # Cache by query content
            "strategy": RoutingStrategy.HYBRID,
            "use_learning": True,
            "decompose_complex_queries": True,
        }
        
        # Update with any provided config
        if config:
            default_config.update(config)
            
        super().__init__(default_config)
        
        # Initialize agent registry
        self.agent_registry = self._initialize_agent_registry()
        
        # Initialize learning system
        self.routing_history = []
        self.feedback_history = []
        self.query_embedding_cache = {}
        
        # Load historical data if available
        self._load_learning_data()
        
        logger.info(f"[{self.name}] Initialized with {len(self.agent_registry)} registered agents")

    def _initialize_agent_registry(self) -> Dict[str, AgentProfile]:
        """Initialize the registry of available agents with their profiles"""
        registry = {}
        
        # Core agents
        registry["query"] = AgentProfile(
            name="QueryAgent",
            role="Query understanding and reformulation",
            specialties=["query understanding", "semantic parsing", "disambiguation"],
            required_inputs=["query"],
            keywords=["clarify", "understand", "what do you mean", "rephrase"]
        )
        
        registry["retrieval"] = AgentProfile(
            name="RetrievalAgent",
            role="Information retrieval and context building",
            specialties=["document retrieval", "context building", "knowledge extraction"],
            required_inputs=["query"],
            keywords=["find", "search", "retrieve", "lookup", "documents", "information about"]
        )
        
        registry["data"] = AgentProfile(
            name="DataAgent",
            role="Data analysis and profiling",
            specialties=["data profiling", "schema analysis", "type inference"],
            required_inputs=["data"],
            keywords=["profile", "analyze data", "dataset", "data structure", "columns"]
        )
        
        registry["cleaner"] = AgentProfile(
            name="DataCleanerAgent",
            role="Data cleaning and preprocessing",
            specialties=["data cleaning", "normalization", "outlier handling"],
            required_inputs=["data"],
            keywords=["clean", "preprocess", "normalize", "fix data", "missing values"]
        )
        
        registry["sql"] = AgentProfile(
            name="SQLAgent",
            role="SQL query generation and execution",
            specialties=["SQL generation", "database querying", "data filtering"],
            required_inputs=["data", "query"],
            keywords=["sql", "query", "select", "filter", "database", "table"]
        )
        
        registry["insight"] = AgentProfile(
            name="InsightAgent",
            role="Insight generation from data",
            specialties=["pattern detection", "trend analysis", "statistical insights"],
            required_inputs=["data"],
            keywords=["insights", "patterns", "tell me about", "analyze", "what can you tell me"]
        )
        
        registry["chart"] = AgentProfile(
            name="ChartAgent", 
            role="Data visualization",
            specialties=["chart generation", "visualization", "graphical representation"],
            required_inputs=["data", "query"],
            keywords=["chart", "plot", "graph", "visualize", "show me", "display"]
        )
        
        registry["critique"] = AgentProfile(
            name="CritiqueAgent",
            role="Analysis evaluation and critique",
            specialties=["result evaluation", "methodology critique", "bias detection"],
            required_inputs=["analysis_result", "query"],
            keywords=["evaluate", "critique", "review", "assess", "check", "validate"]
        )
        
        registry["debate"] = AgentProfile(
            name="DebateAgent",
            role="Multi-perspective analysis",
            specialties=["argumentation", "perspective generation", "balanced analysis"],
            required_inputs=["query", "context"],
            keywords=["debate", "perspectives", "pros and cons", "different views", "argue"]
        )
        
        registry["narrative"] = AgentProfile(
            name="NarrativeAgent",
            role="Narrative generation from insights",
            specialties=["storytelling", "narrative construction", "coherent explanations"],
            required_inputs=["insights", "query"],
            keywords=["explain", "narrate", "story", "tell me", "describe"]
        )
        
        registry["report"] = AgentProfile(
            name="ReportGenerator",
            role="Comprehensive report generation",
            specialties=["report creation", "document generation", "presentation"],
            required_inputs=["insights", "charts", "query"],
            keywords=["report", "document", "summary", "create report", "export"]
        )
        
        return registry

    def _load_learning_data(self):
        """Load historical routing and feedback data if available"""
        try:
            data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
            routing_file = os.path.join(data_dir, "planning_routing_history.pkl")
            feedback_file = os.path.join(data_dir, "planning_feedback_history.pkl")
            
            if os.path.exists(routing_file):
                with open(routing_file, "rb") as f:
                    self.routing_history = pickle.load(f)
                logger.info(f"[{self.name}] Loaded {len(self.routing_history)} historical routing decisions")
                
            if os.path.exists(feedback_file):
                with open(feedback_file, "rb") as f:
                    self.feedback_history = pickle.load(f)
                logger.info(f"[{self.name}] Loaded {len(self.feedback_history)} feedback entries")
        except Exception as e:
            logger.warning(f"[{self.name}] Could not load learning data: {str(e)}")

    def _save_learning_data(self):
        """Save routing and feedback history for future learning"""
        try:
            data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
            os.makedirs(data_dir, exist_ok=True)
            
            # Limit size of history to prevent unbounded growth
            max_history = self.config.max_plan_history
            routing_history = self.routing_history[-max_history:] if len(self.routing_history) > max_history else self.routing_history
            feedback_history = self.feedback_history[-max_history:] if len(self.feedback_history) > max_history else self.feedback_history
            
            # Save data
            with open(os.path.join(data_dir, "planning_routing_history.pkl"), "wb") as f:
                pickle.dump(routing_history, f)
                
            with open(os.path.join(data_dir, "planning_feedback_history.pkl"), "wb") as f:
                pickle.dump(feedback_history, f)
                
            logger.info(f"[{self.name}] Saved learning data: {len(routing_history)} routing entries, {len(feedback_history)} feedback entries")
        except Exception as e:
            logger.warning(f"[{self.name}] Could not save learning data: {str(e)}")

    def add_feedback(self, feedback: RoutingFeedback):
        """Add feedback about a routing decision to improve future decisions"""
        self.feedback_history.append(feedback)
        
        # Update agent profiles based on feedback
        if feedback.actual_agent:
            # This was a correction, boost the correct agent's keywords
            agent_profile = self.agent_registry.get(feedback.actual_agent)
            if agent_profile and feedback.query:
                # Extract potentially important terms from the query
                terms = re.findall(r'\b\w+\b', feedback.query.lower())
                for term in terms:
                    if len(term) > 3 and term not in agent_profile.keywords:
                        agent_profile.keywords.append(term)
                        
        # Update success rates
        agent_profile = self.agent_registry.get(feedback.routed_agent)
        if agent_profile:
            agent_profile.call_count += 1
            # Running average of success rate
            agent_profile.success_rate = (
                (agent_profile.success_rate * (agent_profile.call_count - 1) + int(feedback.was_successful)) / 
                agent_profile.call_count
            )
            agent_profile.last_called = datetime.now()
        
        # Save updated learning data
        self._save_learning_data()

    def analyze_query_complexity(self, query: str) -> float:
        """
        Analyze the complexity of a query to determine if it needs decomposition.
        Returns a score between 0 and 1, where higher values indicate more complexity.
        """
        # Simple heuristics for complexity
        complexity = 0.0
        
        # Multiple questions in one query
        if query.count("?") > 1:
            complexity += 0.3
            
        # Multiple requested operations
        conjunctions = ["and", "also", "additionally", "then", "after that"]
        for conj in conjunctions:
            if f" {conj} " in query.lower():
                complexity += 0.2
                
        # Length-based complexity
        words = query.split()
        if len(words) > 15:
            complexity += min((len(words) - 15) / 50, 0.3)  # Cap at 0.3
            
        # Multiple named entities suggest complexity
        return min(complexity, 1.0)  # Cap at 1.0

    def decompose_query(self, query: str) -> List[SubQuery]:
        """
        Decompose a complex query into simpler sub-queries.
        Each sub-query can be routed to the most appropriate agent.
        """
        # This would use an LLM to decompose in a real implementation
        # Here we use a simple rule-based approach for demonstration
        sub_queries = []
        
        # Check for compound queries with "and"
        parts = re.split(r'\s+and\s+', query)
        
        if len(parts) == 1:
            # Check for sequence with "then"
            parts = re.split(r'\s+then\s+', query)
            
        if len(parts) > 1:
            # We have multiple parts to process
            for i, part in enumerate(parts):
                # Determine intent and agent for each part
                intent, agent, confidence = self._determine_intent_and_agent(part)
                
                dependencies = []
                if i > 0:
                    # This step depends on the previous one
                    dependencies.append(sub_queries[i-1].id)
                
                sub_query = SubQuery(
                    text=part,
                    intent=intent,
                    agent=agent,
                    confidence=confidence,
                    order=i,
                    depends_on=dependencies
                )
                sub_queries.append(sub_query)
        else:
            # Single query but might be complex - for now treat as one
            intent, agent, confidence = self._determine_intent_and_agent(query)
            sub_query = SubQuery(
                text=query,
                intent=intent,
                agent=agent,
                confidence=confidence,
                order=0,
                depends_on=[]
            )
            sub_queries.append(sub_query)
            
        return sub_queries

    def consider_data_context(self, query: str, data: Optional[pd.DataFrame]) -> Dict[str, float]:
        """
        Adjust routing scores based on available data context.
        Returns dict of agent_name -> adjustment factor
        """
        adjustments = {}
        
        if data is None:
            # No data provided, penalize data-heavy agents
            data_agents = ["data", "cleaner", "sql", "chart", "insight"]
            for agent in data_agents:
                adjustments[agent] = -0.2
            return adjustments
            
        # We have data, analyze its characteristics
        try:
            col_count = len(data.columns)
            row_count = len(data)
            
            # Check for time series columns
            has_timeseries = any(pd.api.types.is_datetime64_any_dtype(data[col]) for col in data.columns)
            
            # Check for categorical columns
            categorical_cols = [col for col in data.columns if pd.api.types.is_categorical_dtype(data[col]) or pd.api.types.is_object_dtype(data[col])]
            categorical_count = len(categorical_cols)
            
            # Check for numeric columns
            numeric_cols = [col for col in data.columns if pd.api.types.is_numeric_dtype(data[col])]
            numeric_count = len(numeric_cols)
            
            # Adjust agent scores based on data characteristics
            if col_count > 15:
                # Complex dataset might need SQL
                adjustments["sql"] = 0.1
                
            if row_count > 1000:
                # Larger datasets benefit from data agent and SQL
                adjustments["data"] = 0.1
                adjustments["sql"] = 0.1
                
            if has_timeseries and numeric_count > 0:
                # Time series with numeric data is good for charts and trends
                adjustments["chart"] = 0.2
                adjustments["insight"] = 0.15
                
            if categorical_count > 0 and numeric_count > 0:
                # Good for charts comparing categories
                adjustments["chart"] = 0.15
                
            if row_count < 5:
                # Very small dataset, might not need complex agents
                adjustments["chart"] = -0.1
                adjustments["sql"] = -0.1
                
            # Check for data quality issues
            missing_values = data.isnull().any(axis=1).sum()
            if missing_values / row_count > 0.1:
                # More than 10% of rows have missing values
                adjustments["cleaner"] = 0.2
                
        except Exception as e:
            logger.warning(f"[{self.name}] Error analyzing data context: {str(e)}")
            
        return adjustments

    def _determine_intent_and_agent(self, query: str) -> Tuple[str, str, float]:
        """
        Determine the intent of a query and the most appropriate agent.
        Returns (intent, agent_name, confidence)
        """
        # In a real implementation, this would use more sophisticated NLU
        # and potentially embeddings for matching
        
        query_lower = query.lower()
        
        # Define intents and their patterns/keywords
        intents = {
            "data_visualization": ["chart", "plot", "graph", "visualize", "show me", "display"],
            "data_analysis": ["analyze", "statistics", "correlation", "distribution", "relationship"],
            "data_cleaning": ["clean", "remove", "fix", "missing values", "normalize", "standardize"],
            "sql_query": ["sql", "query", "select", "filter", "where", "join", "group by"],
            "insight_generation": ["insights", "patterns", "tell me about", "what can you tell me"],
            "critique": ["evaluate", "critique", "review", "assess", "check", "validate"],
            "debate": ["debate", "perspectives", "pros and cons", "different views"],
            "narrative": ["explain", "narrate", "story", "describe"],
            "report": ["report", "document", "summary", "create report", "export"]
        }
        
        # Score each intent
        intent_scores = {}
        for intent, keywords in intents.items():
            score = sum(1.0 for keyword in keywords if keyword in query_lower)
            # Normalize by number of keywords
            intent_scores[intent] = score / max(len(keywords), 1)
            
        # Get the highest scoring intent
        if not intent_scores:
            return "unknown", "insight", 0.5
            
        best_intent = max(intent_scores.items(), key=lambda x: x[1])
        
        # Map intents to agents
        intent_agent_map = {
            "data_visualization": "chart",
            "data_analysis": "data",
            "data_cleaning": "cleaner",
            "sql_query": "sql",
            "insight_generation": "insight",
            "critique": "critique",
            "debate": "debate",
            "narrative": "narrative",
            "report": "report"
        }
        
        agent = intent_agent_map.get(best_intent[0], "insight")
        confidence = best_intent[1]
        
        # If confidence is too low, default to insight agent
        if confidence < 0.2:
            return "general_inquiry", "insight", 0.5
            
        return best_intent[0], agent, confidence

    def _learn_from_history(self, query: str) -> Dict[str, float]:
        """
        Use historical data to improve routing decisions.
        Returns dict of agent_name -> adjustment factor
        """
        if not self.routing_history or not self.feedback_history:
            return {}
            
        adjustments = {}
        
        # Find similar queries in history
        similar_queries = []
        query_terms = set(re.findall(r'\b\w+\b', query.lower()))
        
        for entry in self.routing_history:
            entry_terms = set(re.findall(r'\b\w+\b', entry.get("query", "").lower()))
            if query_terms.intersection(entry_terms):
                similarity = len(query_terms.intersection(entry_terms)) / max(len(query_terms), len(entry_terms))
                if similarity > 0.3:  # Threshold for similarity
                    similar_queries.append((entry, similarity))
        
        # Sort by similarity
        similar_queries.sort(key=lambda x: x[1], reverse=True)
        
        # Consider only top 5 similar queries
        for entry, similarity in similar_queries[:5]:
            agent = entry.get("agent", "")
            if agent:
                # Check if we have feedback on this decision
                feedback_entries = [f for f in self.feedback_history if f.query_id == entry.get("query_id")]
                
                if feedback_entries:
                    feedback = feedback_entries[0]
                    # If it was successful, boost the agent
                    if feedback.was_successful:
                        adjustments[agent] = adjustments.get(agent, 0) + (0.1 * similarity)
                    else:
                        # If unsuccessful, slightly penalize
                        adjustments[agent] = adjustments.get(agent, 0) - (0.05 * similarity)
                        # If we know the better agent, boost it
                        if feedback.actual_agent:
                            adjustments[feedback.actual_agent] = adjustments.get(feedback.actual_agent, 0) + (0.1 * similarity)
                else:
                    # No explicit feedback, slightly boost based on similarity
                    adjustments[agent] = adjustments.get(agent, 0) + (0.05 * similarity)
        
        return adjustments

    def balance_workloads(self) -> Dict[str, float]:
        """
        Balance workloads across agents based on recent usage.
        Returns dict of agent_name -> adjustment factor
        """
        if not self.config.workload_balancing:
            return {}
            
        adjustments = {}
        
        # Count recent calls per agent
        now = datetime.now()
        agent_calls = defaultdict(int)
        
        for profile in self.agent_registry.values():
            if profile.last_called:
                # Only consider calls in the last hour
                time_diff = (now - profile.last_called).total_seconds() / 3600
                if time_diff < 1:
                    agent_calls[profile.name] = profile.call_count
        
        if not agent_calls:
            return {}
            
        # Find most and least used agents
        max_calls = max(agent_calls.values()) if agent_calls else 0
        min_calls = min(agent_calls.values()) if agent_calls else 0
        
        # Don't adjust if the difference is small
        if max_calls - min_calls < 3:
            return {}
            
        # Balance by slightly penalizing heavily used agents
        for agent, calls in agent_calls.items():
            if calls > max_calls * 0.8:
                adjustments[agent] = -0.05
            elif calls < min_calls * 1.2:
                adjustments[agent] = 0.05
                
        return adjustments

    def _execute(self, query: str, data: pd.DataFrame = None, **kwargs) -> Dict[str, Any]:
        """
        Enhanced planning logic with learning, decomposition and context awareness.
        
        Args:
            query: The user's question
            data: Optional DataFrame for context
            **kwargs: Additional parameters
            
        Returns:
            Dict with planning output
        """
        logger.info(f"[{self.name}] Planning execution for query: {query}")
        query_id = str(uuid.uuid4())
        
        try:
            # Step 1: Analyze query complexity
            complexity = self.analyze_query_complexity(query)
            logger.debug(f"[{self.name}] Query complexity: {complexity}")
            
            # Step 2: Decompose if complex enough and enabled
            sub_queries = []
            if complexity > 0.6 and self.config.decompose_complex_queries:
                sub_queries = self.decompose_query(query)
                logger.debug(f"[{self.name}] Decomposed into {len(sub_queries)} sub-queries")
            
            # Step 3: For the main query (or only query if not decomposed)
            # determine the primary agent using various strategies
            adjustments = {}
            
            # Core routing logic - keyword or hybrid matching
            intent, primary_agent, base_confidence = self._determine_intent_and_agent(query)
            
            # Step 4: If enabled, consider the data context
            if data is not None and self.config.consider_data_state:
                data_adjustments = self.consider_data_context(query, data)
                for agent, adj in data_adjustments.items():
                    adjustments[agent] = adjustments.get(agent, 0) + adj
            
            # Step 5: If enabled, learn from history
            if self.config.use_learning:
                history_adjustments = self._learn_from_history(query)
                for agent, adj in history_adjustments.items():
                    adjustments[agent] = adjustments.get(agent, 0) + adj
            
            # Step 6: If enabled, balance workloads
            if self.config.workload_balancing:
                balance_adjustments = self.balance_workloads()
                for agent, adj in balance_adjustments.items():
                    adjustments[agent] = adjustments.get(agent, 0) + adj
            
            # Apply adjustments to base confidence if this is the same agent
            final_confidence = base_confidence
            if primary_agent in adjustments:
                final_confidence = min(max(base_confidence + adjustments.get(primary_agent, 0), 0.1), 0.95)
            
            # Check if any other agent has higher adjusted confidence
            for agent, adj in adjustments.items():
                adjusted_confidence = 0.5 + adj  # Base neutral confidence plus adjustment
                if agent != primary_agent and adjusted_confidence > final_confidence:
                    primary_agent = agent
                    final_confidence = adjusted_confidence
                    logger.debug(f"[{self.name}] Routing changed to {agent} based on adjustments")
            
            # If confidence is below threshold, use fallback
            if final_confidence < self.config.min_confidence_threshold:
                primary_agent = self.config.fallback_agent
                final_confidence = 0.5  # Neutral confidence for fallback
                logger.debug(f"[{self.name}] Using fallback agent {primary_agent} due to low confidence")
            
            # Determine if data is required based on agent profile
            agent_profile = self.agent_registry.get(primary_agent, None)
            requires_data = agent_profile and "data" in agent_profile.required_inputs
            
            # Estimate execution time based on agent profile and complexity
            expected_time = 1.0  # Base execution time in seconds
            if agent_profile:
                expected_time = agent_profile.avg_execution_time if agent_profile.avg_execution_time > 0 else 1.0
            expected_time = expected_time * (1 + complexity * 0.5)  # Adjust for complexity
            
            # Create the planning outcome
            planning_outcome = {
                "query_id": query_id,
                "query": query,
                "primary_agent": primary_agent,
                "confidence": final_confidence,
                "requires_data": requires_data,
                "expected_execution_time": expected_time,
                "intent": intent,
                "complexity": complexity,
                "has_sub_queries": bool(sub_queries),
            }
            
            # Include sub-queries if present
            if sub_queries:
                planning_outcome["sub_queries"] = [sq.dict() for sq in sub_queries]
            
            # Store in routing history
            self.routing_history.append({
                "query_id": query_id,
                "query": query,
                "agent": primary_agent, 
                "confidence": final_confidence,
                "timestamp": datetime.now().isoformat()
            })
            
            # Save periodically
            if len(self.routing_history) % 10 == 0:
                self._save_learning_data()
            
            return planning_outcome
        
        except Exception as e:
            logger.error(f"[{self.name}] Error in planning: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            
            # Return fallback plan on error
            return {
                "query_id": query_id,
                "query": query,
                "primary_agent": self.config.fallback_agent,
                "confidence": 0.3,
                "requires_data": False,
                "expected_execution_time": 1.0,
                "error": str(e),
                "intent": "unknown",
            }

    def plan(self, user_query: str, data: pd.DataFrame = None) -> Dict[str, Any]:
        """
        Plan execution for a user query, determining agents and execution flow.
        
        Args:
            user_query (str): The user's question
            data (pd.DataFrame, optional): The data context if available
            
        Returns:
            Dict[str, Any]: Planning outcome with agent routing
        """
        logger.info(f"[{self.name}] plan called with user_query: {user_query}")
        return self.run(user_query, data)

    def update_from_feedback(self, query_id: str, was_successful: bool, 
                            actual_agent: Optional[str] = None, 
                            error_message: Optional[str] = None,
                            execution_time: Optional[float] = None):
        """
        Update the planning model based on feedback from execution.
        
        Args:
            query_id (str): The ID of the original query
            was_successful (bool): Whether the execution was successful
            actual_agent (str, optional): The agent that should have handled it if known
            error_message (str, optional): Error message if execution failed
            execution_time (float, optional): Actual execution time in seconds
        """
        # Find the original query
        query = ""
        for entry in self.routing_history:
            if entry.get("query_id") == query_id:
                query = entry.get("query", "")
                routed_agent = entry.get("agent", "")
                break
        
        if not query:
            logger.warning(f"[{self.name}] Could not find query with ID {query_id} for feedback")
            return
            
        # Create feedback entry
        feedback = RoutingFeedback(
            query_id=query_id,
            query=query,
            routed_agent=routed_agent,
            actual_agent=actual_agent,
            was_successful=was_successful,
            error_message=error_message,
            execution_time=execution_time or 0.0
        )
        
        # Add to learning system
        self.add_feedback(feedback)
        
        logger.info(f"[{self.name}] Added feedback for query {query_id}: success={was_successful}")
