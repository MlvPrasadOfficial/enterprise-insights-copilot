"""
QueryAgent: Advanced query understanding, rewriting, and semantic parsing
with domain adaptation and clarification mechanisms.
"""

from backend.agents.base_agent import BaseAgent, AgentConfig, CachePolicy
from backend.core.llm_rag import run_rag
from backend.core.logging import logger
from typing import Any, Dict, List, Optional, Tuple, Union
import pandas as pd
import re
import json
from pydantic import BaseModel, Field

class Intent(str, Enum):
    """Classification of query intents"""
    INFORMATION = "information"  # General information seeking
    ANALYSIS = "analysis"        # Request for data analysis
    COMPARISON = "comparison"    # Request to compare entities or data points
    VISUALIZATION = "visualization"  # Request for charts or graphs
    PREDICTION = "prediction"    # Request for forecasting or prediction
    EXPLORATION = "exploration"  # Explore data without specific goal
    CLARIFICATION = "clarification"  # Follow-up questions or clarifications
    ACTION = "action"            # Request to perform an action


class Entity(BaseModel):
    """Extracted entity from a user query"""
    text: str = Field(..., description="The extracted text of the entity")
    type: str = Field(..., description="The type/category of the entity")
    start: int = Field(..., description="Start position in original text")
    end: int = Field(..., description="End position in original text")
    confidence: float = Field(..., description="Confidence score of extraction")
    normalized_value: Optional[str] = Field(None, description="Standardized value")
    
    
class QueryAnalysis(BaseModel):
    """Comprehensive query analysis result"""
    original_query: str = Field(..., description="Original user query")
    rewritten_query: Optional[str] = Field(None, description="Rewritten query for better retrieval")
    intents: List[Dict[str, float]] = Field(default_factory=list, description="Detected intents and confidence scores")
    entities: List[Entity] = Field(default_factory=list, description="Extracted entities")
    ambiguous: bool = Field(False, description="Whether query is ambiguous and needs clarification")
    clarification_questions: Optional[List[str]] = Field(None, description="Questions to ask if ambiguous")
    domain: Optional[str] = Field(None, description="Detected domain or topic area")
    complexity: float = Field(0.0, description="Estimated query complexity (0-1)")
    
    def primary_intent(self) -> str:
        """Get the primary intent of the query"""
        if not self.intents:
            return "information"
        return max(self.intents, key=lambda x: list(x.values())[0])


class QueryKnowledgeGraph:
    """Track relationships between queries for context building"""
    def __init__(self):
        self.queries = {}
        self.relationships = {}
        
    def add_query(self, query_id: str, query: str, analysis: QueryAnalysis):
        """Add a query to the knowledge graph"""
        self.queries[query_id] = {
            "query": query,
            "analysis": analysis.dict(),
            "timestamp": datetime.now().isoformat()
        }
    
    def add_relationship(self, source_id: str, target_id: str, relation_type: str):
        """Add a relationship between queries"""
        if source_id not in self.relationships:
            self.relationships[source_id] = []
        self.relationships[source_id].append({
            "target": target_id,
            "type": relation_type
        })
    
    def get_related_queries(self, query_id: str) -> List[Dict]:
        """Get queries related to the given query"""
        if query_id not in self.relationships:
            return []
        
        related = []
        for relation in self.relationships[query_id]:
            target_id = relation["target"]
            if target_id in self.queries:
                related.append({
                    **self.queries[target_id],
                    "relation": relation["type"]
                })
        return related


class QueryRewriter:
    """Rewrite queries for better retrieval and understanding"""
    
    def __init__(self, model: str = "gpt-4"):
        self.model = model
        
    def rewrite(self, query: str) -> str:
        """Rewrite a query for improved retrieval"""
        # In a real implementation, this would call an LLM
        # Simulating improved query rewriting
        query = re.sub(r'\bshow\b', 'visualize', query, flags=re.IGNORECASE)
        query = re.sub(r'\btell me about\b', 'provide information regarding', query, flags=re.IGNORECASE)
        query = re.sub(r'\bwhat is\b', 'define', query, flags=re.IGNORECASE)
        return query
        
    def expand(self, query: str) -> str:
        """Expand query with relevant terms"""
        # In a real implementation, this would call an LLM or use embeddings
        return query


class QueryAgent(BaseAgent):
    name = "QueryAgent"
    role = "Advanced query understanding, rewriting, and routing with semantic parsing."

    def __init__(self, config=None):
        """
        Initialize QueryAgent with enhanced capabilities.

        Args:
            config: Optional configuration dictionary.
        """
        # Set default configuration for query agent
        default_config = {
            "temperature": 0.3,  # Lower temperature for more deterministic results
            "model": "gpt-4",    # More capable model for complex parsing
            "cache_policy": CachePolicy.QUERY,  # Cache by query content
            "cache_ttl": 3600,   # Cache for 1 hour
        }
        
        # Update with any provided config
        if config:
            default_config.update(config)
            
        super().__init__(default_config)
        
        # Initialize knowledge graph
        self.knowledge_graph = QueryKnowledgeGraph()
        
        # Initialize query rewriter
        self.rewriter = QueryRewriter(model=self.config.model)
        
        # Track session for context
        self.session_context = {}
        
        logger.info(f"[{self.name}] Initialized with enhanced capabilities")

    def parse_query(self, query: str) -> QueryAnalysis:
        """
        Perform semantic parsing on the query to extract structure.
        
        Args:
            query: The user's question
            
        Returns:
            QueryAnalysis: Structured analysis of the query
        """
        try:
            # This would normally call an LLM for parsing
            # Simulating the response structure
            
            # Basic intent detection
            intents = []
            if "chart" in query.lower() or "graph" in query.lower() or "plot" in query.lower():
                intents.append({"visualization": 0.85})
            elif "compare" in query.lower() or "difference between" in query.lower():
                intents.append({"comparison": 0.9})
            elif "why" in query.lower() or "how" in query.lower():
                intents.append({"analysis": 0.7})
            elif "will" in query.lower() or "future" in query.lower() or "predict" in query.lower():
                intents.append({"prediction": 0.8})
            else:
                intents.append({"information": 0.6})
            
            # Detect ambiguity
            ambiguous = "or" in query.lower() and "?" in query
            
            # Extract entities (simplified)
            entities = []
            # In a real implementation, we'd use NER
            
            # Domain detection
            domain = None
            if "sales" in query.lower():
                domain = "sales"
            elif "finance" in query.lower() or "financial" in query.lower():
                domain = "finance"
            
            # Query complexity
            words = query.split()
            complexity = min(len(words) / 20, 1.0)  # Simple heuristic
            
            # Create analysis object
            analysis = QueryAnalysis(
                original_query=query,
                rewritten_query=self.rewriter.rewrite(query),
                intents=intents,
                entities=entities,
                ambiguous=ambiguous,
                domain=domain,
                complexity=complexity
            )
            
            # Add clarification questions if needed
            if ambiguous:
                analysis.clarification_questions = [
                    "Could you clarify which specific aspect you're interested in?",
                    "I noticed your question might have multiple interpretations. Can you provide more details?"
                ]
            
            return analysis
            
        except Exception as e:
            logger.error(f"[{self.name}] Error in query parsing: {str(e)}")
            # Return basic analysis on error
            return QueryAnalysis(
                original_query=query,
                intents=[{"information": 0.5}]
            )

    def clarify_query(self, query: str, analysis: QueryAnalysis) -> Optional[Dict[str, Any]]:
        """
        Generate clarification questions for ambiguous queries.
        
        Args:
            query: The original query
            analysis: The query analysis
            
        Returns:
            Optional dict with clarification questions if needed
        """
        if not analysis.ambiguous:
            return None
            
        return {
            "needs_clarification": True,
            "original_query": query,
            "questions": analysis.clarification_questions or [
                "Could you provide more specific information about what you're looking for?",
                "I'm not sure which aspect you want me to focus on. Can you clarify?"
            ]
        }

    def adapt_to_domain(self, query: str, domain: str) -> Dict[str, Any]:
        """
        Apply domain-specific processing to the query.
        
        Args:
            query: The original query
            domain: The detected domain
            
        Returns:
            Dict with domain-specific context
        """
        domain_context = {}
        
        if domain == "finance":
            domain_context = {
                "key_metrics": ["revenue", "profit", "expenses", "ROI", "margin"],
                "typical_timeframes": ["quarterly", "annual", "YTD"],
                "common_visualizations": ["trend line", "bar chart", "pie chart"]
            }
        elif domain == "sales":
            domain_context = {
                "key_metrics": ["conversion rate", "sales volume", "customer acquisition cost"],
                "typical_timeframes": ["daily", "weekly", "monthly"],
                "common_visualizations": ["funnel chart", "heat map", "time series"]
            }
        
        return {
            "domain": domain,
            "domain_context": domain_context
        }

    def extract_entities(self, query: str) -> List[Dict[str, Any]]:
        """
        Extract and normalize entities from the query.
        
        Args:
            query: The user's question
            
        Returns:
            List of extracted entities with metadata
        """
        # In a real implementation, this would use a named entity recognition model
        entities = []
        
        # Simple pattern matching for demonstration
        # Date patterns - split into year pattern and month pattern for complexity
        year_matches = re.finditer(r'\b(?:19|20)\d{2}\b', query.lower())
        for match in year_matches:
            entities.append({
                "text": match.group(0),
                "type": "date",
                "start": match.start(),
                "end": match.end(),
                "confidence": 0.9,
                "normalized_value": match.group(0)
            })
            
        # Process month patterns
        month_patterns = [
            r'\b(?:january|february|march|april|may|june|july)\b',
            r'\b(?:august|september|october|november|december)\b',
            r'\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b'
        ]
        
        for pattern in month_patterns:
            month_matches = re.finditer(pattern, query.lower())
            for match in month_matches:
                entities.append({
                    "text": match.group(0),
                    "type": "date",
                    "start": match.start(),
                    "end": match.end(),
                    "confidence": 0.8,
                    "normalized_value": match.group(0)
                })
        
        # Number patterns
        number_matches = re.finditer(r'\b\d+(?:\.\d+)?\b', query.lower())
        for match in number_matches:
            entities.append({
                "text": match.group(0),
                "type": "number",
                "start": match.start(),
                "end": match.end(),
                "confidence": 0.9,
                "normalized_value": match.group(0)
            })
        
        return entities

    def build_query_context(self, query: str, session_id: str) -> Dict[str, Any]:
        """
        Build rich context for the query based on session history and knowledge graph.
        
        Args:
            query: The user's question
            session_id: Session identifier
            
        Returns:
            Dict with enriched query context
        """
        context = {
            "original_query": query,
            "timestamp": datetime.now().isoformat(),
            "session_id": session_id
        }
        
        # Add session context if available
        if session_id in self.session_context:
            context["session_history"] = self.session_context[session_id].get("history", [])
            context["session_topic"] = self.session_context[session_id].get("topic")
        
        # Check for related queries in knowledge graph
        if hasattr(self, 'knowledge_graph') and session_id in getattr(self, 'knowledge_graph').queries:
            related_queries = self.knowledge_graph.get_related_queries(session_id)
            if related_queries:
                context["related_queries"] = related_queries
        
        return context

    def _execute(self, query: str, data: pd.DataFrame = None, **kwargs) -> Dict[str, Any]:
        """
        Enhanced query processing with semantic parsing, rewriting and clarification.

        Args:
            query (str): The user's question.
            data (pd.DataFrame): The data context (may be unused for pure RAG).
            **kwargs: Additional context parameters.

        Returns:
            Dict[str, Any]: Dictionary containing the enhanced response.
        """
        session_id = kwargs.get("session_id", "default")
        logger.info(f"[{self.name}] Processing query: {query}")
        
        try:
            # Step 1: Parse and analyze the query
            query_analysis = self.parse_query(query)
            
            # Step 2: Check if clarification is needed
            clarification = self.clarify_query(query, query_analysis)
            if clarification:
                return clarification
            
            # Step 3: Apply domain adaptation if available
            domain_context = {}
            if query_analysis.domain:
                domain_context = self.adapt_to_domain(query, query_analysis.domain)
            
            # Step 4: Extract entities
            entities = self.extract_entities(query)
            
            # Step 5: Build query context from session and knowledge graph
            query_context = self.build_query_context(query, session_id)
            
            # Step 6: Use rewritten query if available
            effective_query = query_analysis.rewritten_query or query
            
            # Step 7: Route to run RAG with enhanced context
            rag_response = run_rag(
                effective_query,
                additional_context={
                    "analysis": query_analysis.dict(),
                    "domain": domain_context,
                    "entities": entities,
                    "session_context": query_context,
                    "intent": query_analysis.primary_intent() if hasattr(query_analysis, 'primary_intent') else None
                }
            )
            
            # Step 8: Store in knowledge graph for future reference
            query_id = f"{session_id}_{uuid.uuid4()}"
            if hasattr(self, 'knowledge_graph'):
                self.knowledge_graph.add_query(query_id, query, query_analysis)
                
                # Link to previous query if this is a follow-up
                if session_id in self.session_context and "last_query_id" in self.session_context[session_id]:
                    last_query_id = self.session_context[session_id]["last_query_id"]
                    self.knowledge_graph.add_relationship(last_query_id, query_id, "followed_by")
                
                # Update session context
                if session_id not in self.session_context:
                    self.session_context[session_id] = {"history": []}
                    
                self.session_context[session_id]["last_query_id"] = query_id
                self.session_context[session_id]["history"].append({
                    "query": query,
                    "timestamp": datetime.now().isoformat(),
                    "query_id": query_id
                })
                
                # Limit history length
                if len(self.session_context[session_id]["history"]) > 10:
                    self.session_context[session_id]["history"] = self.session_context[session_id]["history"][-10:]
            
            # Return enhanced response
            return {
                "response": rag_response,
                "source": "enhanced_rag_pipeline",
                "query_analyzed": effective_query,
                "original_query": query,
                "analysis": {
                    "intents": query_analysis.intents,
                    "entities": [e.dict() for e in query_analysis.entities] if hasattr(query_analysis, 'entities') else entities,
                    "domain": query_analysis.domain,
                    "complexity": query_analysis.complexity
                }
            }
        except Exception as e:
            logger.error(f"[{self.name}] Error in enhanced query processing: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            
            return {
                "error": f"Failed to process query: {str(e)}",
                "partial_response": "I couldn't properly analyze your question. Could you rephrase it?",
                "query": query
            }

    def retrieve(self, user_query: str, data: Any = None) -> Any:
        """
        Enhanced retrieval for the agentic flow with query rewriting.

        Args:
            user_query (str): The user's question.
            data (Any): The data to search.

        Returns:
            Any: Retrieved context or None if nothing relevant found.
        """
        try:
            # Analyze and rewrite query for better retrieval
            query_analysis = self.parse_query(user_query)
            effective_query = query_analysis.rewritten_query or user_query
            
            from backend.core.llm_rag import retrieve_relevant_context
            logger.info(f"[{self.name}] Retrieving context for: {effective_query} (original: {user_query})")
            
            # Get context with enhanced query
            context = retrieve_relevant_context(effective_query)
            
            # Add query analysis metadata
            if context:
                if isinstance(context, dict):
                    context["query_analysis"] = query_analysis.dict()
                elif isinstance(context, list):
                    # Add metadata to each context chunk if it's a list of dicts
                    if context and isinstance(context[0], dict):
                        for chunk in context:
                            chunk["query_analysis"] = query_analysis.dict()
            
            return context
        except Exception as e:
            logger.error(f"[{self.name}] Error in enhanced retrieval: {str(e)}")
            return None

    def analyze(self, user_query: str) -> str:
        """
        Analyze a user query using the enhanced RAG pipeline.

        Args:
            user_query (str): The user's question in natural language.

        Returns:
            str: The answer from the RAG pipeline.
        """
        logger.info(f"[{self.name}] analyze called with user_query: {user_query}")
        
        # Parse and analyze the query
        query_analysis = self.parse_query(user_query)
        
        # Use rewritten query if available
        effective_query = query_analysis.rewritten_query or user_query
        logger.info(f"[{self.name}] Rewritten query: {effective_query}")
        
        # Route to run RAG with enhanced query
        return run_rag(effective_query)

# Import at the end to avoid circular imports
from datetime import datetime
import uuid
from enum import Enum
