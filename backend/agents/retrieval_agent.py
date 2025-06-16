"""
RetrievalAgent: Advanced hybrid retrieval system with dense-sparse strategies, 
cross-encoder reranking, query-aware chunking, and knowledge graph navigation.
"""

from backend.agents.base_agent import BaseAgent, AgentConfig, CachePolicy
from typing import Any, Dict, List, Optional, Union, Tuple
import pandas as pd
from backend.core.logging import logger
import hashlib
import json
import os
import uuid
from functools import lru_cache
from datetime import datetime, timedelta
from enum import Enum
import re
from pydantic import BaseModel, Field

class RetrievalStrategy(str, Enum):
    """Available retrieval strategies"""
    DENSE = "dense"          # Dense vector embedding search
    SPARSE = "sparse"        # Sparse vector/BM25 search
    HYBRID = "hybrid"        # Combination of dense and sparse
    KNOWLEDGE_GRAPH = "kg"   # Knowledge graph based retrieval


class RetrievalFilter(BaseModel):
    """Filters for the retrieval process"""
    source: Optional[List[str]] = Field(None, description="Filter by document sources")
    date_range: Optional[Tuple[str, str]] = Field(None, description="Filter by date range (ISO format)")
    file_type: Optional[List[str]] = Field(None, description="Filter by file types")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Filter by custom metadata")
    min_relevance: Optional[float] = Field(None, description="Minimum relevance score (0-1)")


class RetrievalBoost(BaseModel):
    """Boosting parameters for retrieval results"""
    recency: float = Field(default=1.0, description="Boost factor for recent documents")
    popularity: float = Field(default=1.0, description="Boost factor for popular documents")
    keywords: Dict[str, float] = Field(default_factory=dict, description="Boost for specific keywords")
    sources: Dict[str, float] = Field(default_factory=dict, description="Boost for specific sources")


class RetrievalConfig(AgentConfig):
    """Advanced configuration for retrieval agent"""
    strategy: RetrievalStrategy = Field(default=RetrievalStrategy.HYBRID)
    top_k: int = Field(default=5, description="Number of documents to retrieve")
    rerank: bool = Field(default=True, description="Whether to rerank results with cross-encoder")
    rerank_top_k: int = Field(default=20, description="Number of documents to consider for reranking")
    chunk_size: int = Field(default=512, description="Text chunk size for retrieval")
    chunk_overlap: int = Field(default=50, description="Overlap between chunks")
    filters: Optional[RetrievalFilter] = Field(default=None)
    boosts: Optional[RetrievalBoost] = Field(default=None)
    use_knowledge_graph: bool = Field(default=False, description="Use knowledge graph for retrieval augmentation")
    personalize: bool = Field(default=False, description="Apply user-based personalization")


class RelevanceFeedback(BaseModel):
    """User feedback on retrieved documents"""
    document_id: str
    query_id: str
    relevant: bool
    timestamp: datetime = Field(default_factory=datetime.now)
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    feedback_text: Optional[str] = None


class DocumentChunk(BaseModel):
    """A chunk of text from a document"""
    chunk_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_id: str
    content: str
    start_idx: int
    end_idx: int
    metadata: Dict[str, Any] = Field(default_factory=dict)


class RetrievalCache:
    """Enhanced cache for retrieval results with invalidation strategies"""
    _cache = {}
    _cache_ttl = {}  # Time-to-live for cache entries
    _query_chunks = {}  # Track which queries led to which chunks
    _chunk_updates = {}  # Track when chunks were last updated
    DEFAULT_TTL = timedelta(hours=24)  # Default TTL for cache entries
    
    @classmethod
    def get(cls, key: str, user_id: Optional[str] = None):
        """Get a value from cache if it exists and is not expired"""
        # For personalized results, include user in cache key
        actual_key = f"{key}_{user_id}" if user_id else key
        
        if actual_key in cls._cache and datetime.now() < cls._cache_ttl.get(actual_key, datetime.min):
            # Check if any chunks for this query have been updated
            if key in cls._query_chunks:
                chunks = cls._query_chunks[key]
                for chunk_id in chunks:
                    # If chunk was updated after cache entry, invalidate cache
                    if (chunk_id in cls._chunk_updates and 
                        cls._chunk_updates[chunk_id] > cls._cache_ttl[actual_key] - cls.DEFAULT_TTL):
                        return None
            return cls._cache[actual_key]
        return None
        
    @classmethod
    def set(cls, key: str, value: Any, chunk_ids: List[str] = None, user_id: Optional[str] = None, ttl=None):
        """Set a value in cache with optional TTL and track associated chunks"""
        # For personalized results, include user in cache key
        actual_key = f"{key}_{user_id}" if user_id else key
        
        cls._cache[actual_key] = value
        cls._cache_ttl[actual_key] = datetime.now() + (ttl or cls.DEFAULT_TTL)
        
        # Track which chunks are associated with this query
        if chunk_ids:
            cls._query_chunks[key] = chunk_ids
        
    @classmethod
    def invalidate_chunk(cls, chunk_id: str):
        """Mark a chunk as updated, which will invalidate related queries"""
        cls._chunk_updates[chunk_id] = datetime.now()
        
    @classmethod
    def clear(cls):
        """Clear the entire cache"""
        cls._cache = {}
        cls._cache_ttl = {}
        cls._query_chunks = {}
        cls._chunk_updates = {}
        
    @classmethod
    def remove_expired(cls):
        """Remove expired entries from cache"""
        now = datetime.now()
        expired_keys = [k for k, ttl in cls._cache_ttl.items() if now > ttl]
        for key in expired_keys:
            if key in cls._cache:
                del cls._cache[key]
            if key in cls._cache_ttl:
                del cls._cache_ttl[key]


class KnowledgeGraphNavigator:
    """Navigate document relationships using a knowledge graph structure"""
    
    def __init__(self):
        self.entities = {}  # Entity ID -> Entity info
        self.relationships = {}  # (entity1_id, entity2_id) -> relationship info
        self.document_entities = {}  # document_id -> list of entity IDs
        
    def add_entity(self, entity_id: str, entity_type: str, name: str, metadata: Dict = None):
        """Add an entity to the knowledge graph"""
        self.entities[entity_id] = {
            "type": entity_type,
            "name": name,
            "metadata": metadata or {}
        }
        
    def add_relationship(self, entity1_id: str, entity2_id: str, rel_type: str, metadata: Dict = None):
        """Add a relationship between two entities"""
        rel_id = (entity1_id, entity2_id)
        self.relationships[rel_id] = {
            "type": rel_type,
            "metadata": metadata or {}
        }
        
    def link_document_to_entities(self, doc_id: str, entity_ids: List[str]):
        """Link a document to multiple entities"""
        self.document_entities[doc_id] = entity_ids
        
    def find_related_documents(self, entity_id: str, max_hops: int = 2) -> List[str]:
        """Find documents related to an entity through the graph"""
        if entity_id not in self.entities:
            return []
            
        # Start with directly connected documents
        related_docs = []
        for doc_id, entities in self.document_entities.items():
            if entity_id in entities:
                related_docs.append(doc_id)
        
        # If we want to search deeper (multiple hops)
        if max_hops > 1:
            # Find all related entities (1 hop)
            related_entities = set()
            for rel_id in self.relationships:
                if entity_id == rel_id[0]:
                    related_entities.add(rel_id[1])
                elif entity_id == rel_id[1]:
                    related_entities.add(rel_id[0])
            
            # Recursive search through related entities
            for related_entity in related_entities:
                # Prevent infinite recursion by decreasing hops
                related_docs.extend(
                    self.find_related_documents(related_entity, max_hops - 1)
                )
        
        # Remove duplicates and return
        return list(set(related_docs))
    
    def extract_entities_from_query(self, query: str) -> List[str]:
        """Extract entity IDs from a query based on name matching"""
        found_entities = []
        for entity_id, entity_info in self.entities.items():
            if entity_info["name"].lower() in query.lower():
                found_entities.append(entity_id)
        return found_entities


class RetrievalAgent(BaseAgent):
    name = "RetrievalAgent"
    role = "Advanced hybrid retrieval system with cross-encoder reranking and knowledge graph navigation."

    def __init__(self, config=None):
        """Initialize RetrievalAgent with advanced configuration"""
        # Set default configuration
        default_config = {
            "temperature": 0.0,  # Deterministic for retrieval
            "cache_policy": CachePolicy.HYBRID,
            "cache_ttl": 3600,  # 1 hour cache
            "strategy": RetrievalStrategy.HYBRID,
            "top_k": 5,
            "rerank": True,
            "rerank_top_k": 20,
            "chunk_size": 512,
            "chunk_overlap": 50,
            "use_knowledge_graph": True,
            "personalize": False
        }
        
        # Update with any provided config
        if config:
            if isinstance(config, dict):
                for key, value in config.items():
                    default_config[key] = value
            elif hasattr(config, '__dict__'):
                for key, value in config.__dict__.items():
                    if not key.startswith('_'):
                        default_config[key] = value
        
        super().__init__(default_config)
        
        # Initialize advanced components
        self._retrieval_cache = RetrievalCache()
        self._knowledge_graph = KnowledgeGraphNavigator()
        
        # User feedback storage
        self._relevance_feedback = {}
        
        # Initialize sparse retriever (e.g. BM25)
        self._sparse_index = None
        try:
            # In a real implementation, initialize sparse retriever here
            pass
        except Exception as e:
            logger.warning(f"[{self.name}] Could not initialize sparse retriever: {str(e)}")
        
        # Periodically clean expired cache entries
        self._retrieval_cache.remove_expired()
        logger.info(f"[{self.name}] Initialized with enhanced retrieval capabilities")

    def _hash_query(self, query: str, filters: Optional[Dict] = None) -> str:
        """Create a stable hash for a query and filters for caching"""
        hash_input = query.lower().strip()
        if filters:
            # Sort filter keys to ensure consistent hash
            sorted_filters = {k: filters[k] for k in sorted(filters.keys())}
            hash_input += json.dumps(sorted_filters)
        return hashlib.md5(hash_input.encode()).hexdigest()

    def _create_query_chunks(self, query: str) -> List[str]:
        """Break complex queries into smaller, focused queries"""
        # Simple sentence splitting for demonstration
        sentences = re.split(r'[.!?]', query)
        return [s.strip() for s in sentences if len(s.strip()) > 10]
    
    def _perform_dense_retrieval(self, query: str, top_k: int = 5) -> List[Dict]:
        """Perform dense vector retrieval using embeddings"""
        try:
            from backend.core.llm_rag import retrieve_relevant_context
            return retrieve_relevant_context(query, top_k=top_k)
        except Exception as e:
            logger.error(f"[{self.name}] Dense retrieval failed: {str(e)}")
            return []
    
    def _perform_sparse_retrieval(self, query: str, top_k: int = 5) -> List[Dict]:
        """Perform sparse retrieval using BM25 or similar algorithm"""
        try:
            # In a real implementation, this would use a BM25 or similar index
            # This is a simplified placeholder
            keywords = re.findall(r'\w+', query.lower())
            keywords = [k for k in keywords if len(k) > 3]
            
            from backend.core.session_memory import memory
            if hasattr(memory, 'documents') and memory.documents:
                matches = []
                for doc in memory.documents:
                    content = doc.get('content', '').lower()
                    # Calculate a simple keyword match score
                    score = sum(1 for keyword in keywords if keyword in content) / len(keywords) if keywords else 0
                    if score > 0:
                        matches.append({**doc, "score": score})
                
                # Sort by score and return top_k
                return sorted(matches, key=lambda x: x.get("score", 0), reverse=True)[:top_k]
            return []
        except Exception as e:
            logger.error(f"[{self.name}] Sparse retrieval failed: {str(e)}")
            return []
    
    def _hybrid_retrieval(self, query: str, top_k: int = 5) -> List[Dict]:
        """Combine results from dense and sparse retrieval methods"""
        dense_results = self._perform_dense_retrieval(query, top_k=top_k)
        sparse_results = self._perform_sparse_retrieval(query, top_k=top_k)
        
        # Create a dictionary to merge results, using document ID as key
        merged_results = {}
        
        # Add dense results with their scores
        for doc in dense_results:
            doc_id = doc.get('id', str(hash(doc.get('content', ''))))
            merged_results[doc_id] = {
                **doc,
                "dense_score": doc.get("score", 0.0),
                "source": "dense"
            }
        
        # Add or update with sparse results
        for doc in sparse_results:
            doc_id = doc.get('id', str(hash(doc.get('content', ''))))
            if doc_id in merged_results:
                # Document exists from dense results, update with sparse score
                merged_results[doc_id]["sparse_score"] = doc.get("score", 0.0)
                # Calculate combined score (simple average for this example)
                merged_results[doc_id]["score"] = (
                    merged_results[doc_id].get("dense_score", 0.0) + doc.get("score", 0.0)
                ) / 2
                merged_results[doc_id]["source"] = "hybrid"
            else:
                # New document from sparse results
                merged_results[doc_id] = {
                    **doc,
                    "sparse_score": doc.get("score", 0.0),
                    "source": "sparse"
                }
        
        # Convert back to list and sort by combined score
        result_list = list(merged_results.values())
        result_list.sort(key=lambda x: x.get("score", 0.0), reverse=True)
        
        # Return top_k from combined results
        return result_list[:top_k]
    
    def _cross_encoder_rerank(self, query: str, documents: List[Dict], top_k: int = 5) -> List[Dict]:
        """Rerank documents using a cross-encoder model for better relevance"""
        try:
            # In a real implementation, this would use a cross-encoder model
            # For now, simulate reranking with a simple lexical similarity measure
            reranked = []
            for doc in documents:
                content = doc.get('content', '').lower()
                query_terms = query.lower().split()
                
                # Calculate term frequency in document
                term_count = sum(1 for term in query_terms if term in content)
                term_freq = term_count / len(query_terms) if query_terms else 0
                
                # Calculate term density (terms per content length)
                term_density = term_count / len(content) if content else 0
                
                # Combine into a reranking score
                rerank_score = (term_freq * 0.7) + (term_density * 100 * 0.3)
                
                # Copy document and add rerank score
                reranked_doc = {**doc, "rerank_score": rerank_score, "original_score": doc.get("score", 0.0)}
                reranked.append(reranked_doc)
            
            # Sort by rerank score and return top_k
            reranked.sort(key=lambda x: x.get("rerank_score", 0.0), reverse=True)
            return reranked[:top_k]
            
        except Exception as e:
            logger.error(f"[{self.name}] Cross-encoder reranking failed: {str(e)}")
            return documents[:top_k]  # Fall back to original ordering
    
    def _apply_filters(self, documents: List[Dict], filters: RetrievalFilter) -> List[Dict]:
        """Apply filters to retrieval results"""
        if not filters:
            return documents
            
        filtered_docs = documents
        
        # Filter by source
        if filters.source:
            filtered_docs = [doc for doc in filtered_docs 
                           if doc.get('source') in filters.source]
        
        # Filter by date range
        if filters.date_range:
            start_date, end_date = filters.date_range
            filtered_docs = [doc for doc in filtered_docs 
                           if start_date <= doc.get('date', '9999-12-31') <= end_date]
        
        # Filter by file type
        if filters.file_type:
            filtered_docs = [doc for doc in filtered_docs 
                           if doc.get('file_type') in filters.file_type]
        
        # Filter by metadata
        if filters.metadata:
            for key, value in filters.metadata.items():
                filtered_docs = [doc for doc in filtered_docs 
                               if doc.get('metadata', {}).get(key) == value]
        
        # Filter by minimum relevance
        if filters.min_relevance is not None:
            filtered_docs = [doc for doc in filtered_docs 
                           if doc.get('score', 0) >= filters.min_relevance]
        
        return filtered_docs
    
    def _apply_recency_boost(self, doc: Dict, recency_boost: float) -> float:
        """Apply recency boost based on document date"""
        if recency_boost <= 1.0 or 'date' not in doc:
            return 1.0
            
        try:
            date = datetime.fromisoformat(doc['date'])
            days_old = (datetime.now() - date).days
            recency_factor = max(0, 1 - (days_old / 365))  # 1.0 for today, declining over a year
            return (1.0 + (recency_boost - 1.0) * recency_factor)
        except Exception:
            # Skip recency boost if date parsing fails
            return 1.0
    
    def _apply_popularity_boost(self, doc: Dict, popularity_boost: float) -> float:
        """Apply popularity boost based on document popularity"""
        if popularity_boost <= 1.0 or 'popularity' not in doc:
            return 1.0
            
        popularity = min(1.0, doc['popularity'])  # Normalize to 0-1
        return (1.0 + (popularity_boost - 1.0) * popularity)
    
    def _apply_keyword_boosts(self, doc: Dict, keyword_boosts: Dict[str, float]) -> float:
        """Apply boost factors for keywords found in the document"""
        if not keyword_boosts:
            return 1.0
            
        boost_factor = 1.0
        content = doc.get('content', '').lower()
        
        for keyword, factor in keyword_boosts.items():
            if keyword.lower() in content:
                boost_factor *= factor
                
        return boost_factor
    
    def _apply_boosts(self, documents: List[Dict], boosts: RetrievalBoost) -> List[Dict]:
        """Apply boosting factors to retrieval results"""
        if not boosts:
            return documents
            
        for doc in documents:
            # Calculate individual boost components
            recency_boost = self._apply_recency_boost(doc, boosts.recency)
            popularity_boost = self._apply_popularity_boost(doc, boosts.popularity)
            keyword_boost = self._apply_keyword_boosts(doc, boosts.keywords)
            
            # Apply source boost if applicable
            source_boost = 1.0
            source = doc.get('source', '')
            if source in boosts.sources:
                source_boost = boosts.sources[source]
            
            # Calculate final boost score
            boost_score = recency_boost * popularity_boost * keyword_boost * source_boost
            
            # Apply the boost to the document score
            original_score = doc.get('score', 0)
            doc['original_score'] = original_score
            doc['boosted_score'] = original_score * boost_score
            doc['boost_factor'] = boost_score
            doc['score'] = doc['boosted_score']  # Update the main score
            
        # Re-sort by boosted score
        documents.sort(key=lambda x: x.get('score', 0), reverse=True)
        return documents
    
    def store_relevance_feedback(self, feedback: RelevanceFeedback):
        """Store user feedback about document relevance for future personalization"""
        feedback_id = f"{feedback.query_id}_{feedback.document_id}"
        self._relevance_feedback[feedback_id] = feedback.dict()
        logger.info(f"[{self.name}] Stored relevance feedback for document {feedback.document_id}")
        
        # Invalidate cache entries that contain this document
        self._retrieval_cache.invalidate_chunk(feedback.document_id)
    
    def personalize_results(self, documents: List[Dict], user_id: Optional[str]) -> List[Dict]:
        """Personalize results based on user feedback history"""
        if not user_id or not self._relevance_feedback:
            return documents
        
        # Find feedback from this user
        user_feedback = [
            f for f in self._relevance_feedback.values() 
            if f.get('user_id') == user_id
        ]
        
        if not user_feedback:
            return documents
        
        # Build user preference profile
        positive_docs = [f['document_id'] for f in user_feedback if f.get('relevant', False)]
        negative_docs = [f['document_id'] for f in user_feedback if not f.get('relevant', True)]
        
        # Simple personalization: boost documents similar to positive feedback
        # and penalize documents similar to negative feedback
        personalized_docs = []
        for doc in documents:
            doc_id = doc.get('id', '')
            
            # Apply direct boost/penalty for documents with feedback
            if doc_id in positive_docs:
                doc['score'] = doc.get('score', 0) * 1.5
                doc['personalized'] = True
            elif doc_id in negative_docs:
                doc['score'] = doc.get('score', 0) * 0.5
                doc['personalized'] = True
            
            # In a real implementation, would also apply similarity-based personalization
            personalized_docs.append(doc)
        
        # Re-sort by personalized score
        personalized_docs.sort(key=lambda x: x.get('score', 0), reverse=True)
        return personalized_docs

    def _get_retrieval_params(self, **kwargs) -> Dict[str, Any]:
        """Extract retrieval parameters from kwargs and config"""
        return {
            "strategy": kwargs.get("strategy", getattr(self.config, "strategy", RetrievalStrategy.HYBRID)),
            "top_k": kwargs.get("top_k", getattr(self.config, "top_k", 5)),
            "rerank": kwargs.get("rerank", getattr(self.config, "rerank", True)),
            "rerank_top_k": kwargs.get("rerank_top_k", getattr(self.config, "rerank_top_k", 20)),
            "use_kg": kwargs.get("use_knowledge_graph", getattr(self.config, "use_knowledge_graph", False)),
            "personalize": kwargs.get("personalize", getattr(self.config, "personalize", False))
        }
    
    def _check_cache(self, query: str, filters_dict: Dict, user_id: Optional[str], personalize: bool, strategy: str) -> Optional[Dict[str, Any]]:
        """Check if we have a cached result for this query"""
        cache_key = self._hash_query(query, filters_dict)
        cached_result = self._retrieval_cache.get(cache_key, user_id if personalize else None)
        
        if cached_result:
            logger.info(f"[{self.name}] Cache hit for query: {query[:50]}")
            return {
                "context": cached_result,
                "source": "cache",
                "cached": True,
                "strategy": strategy,
                "personalized": personalize and user_id is not None
            }
        return None
    
    def _retrieve_candidates(self, query: str, strategy: str, top_k: int, rerank: bool, rerank_top_k: int) -> List[Dict]:
        """Retrieve initial candidates based on strategy"""
        effective_top_k = rerank_top_k if rerank else top_k
        
        if strategy == RetrievalStrategy.DENSE:
            return self._perform_dense_retrieval(query, top_k=effective_top_k)
        elif strategy == RetrievalStrategy.SPARSE:
            return self._perform_sparse_retrieval(query, top_k=effective_top_k)
        else:  # Default to hybrid
            return self._hybrid_retrieval(query, top_k=effective_top_k)
    
    def _augment_with_kg(self, query: str, candidates: List[Dict]) -> List[Dict]:
        """Augment candidates with knowledge graph results"""
        # Extract entities from query
        query_entities = self._knowledge_graph.extract_entities_from_query(query)
        
        # Find related documents through knowledge graph
        kg_doc_ids = []
        for entity_id in query_entities:
            kg_doc_ids.extend(self._knowledge_graph.find_related_documents(entity_id))
        
        # Fetch and add the kg-related documents
        if kg_doc_ids:
            from backend.core.session_memory import memory
            if hasattr(memory, 'documents'):
                kg_docs = [
                    doc for doc in memory.documents 
                    if doc.get('id', '') in kg_doc_ids
                ]
                # Add KG documents to candidates with a special source tag
                for doc in kg_docs:
                    kg_copy = {**doc, "source": "knowledge_graph", "score": 0.7}
                    if kg_copy not in candidates:
                        candidates.append(kg_copy)
        
        return candidates
    
    def _create_result_metadata(self, params: Dict[str, Any], candidates: List[Dict], final_results: List[Dict]) -> Dict[str, Any]:
        """Create metadata about the retrieval process"""
        return {
            "strategy": params["strategy"],
            "reranked": params["rerank"] and len(candidates) > params["top_k"],
            "filtered": params.get("filters") is not None,
            "boosted": params.get("boosts") is not None,
            "personalized": params["personalize"] and params.get("user_id") is not None,
            "kg_augmented": params["use_kg"] and hasattr(self, '_knowledge_graph'),
            "total_candidates": len(candidates),
            "returned_results": len(final_results)
        }
    
    def _execute(self, query: str, data: Any, **kwargs) -> Dict[str, Any]:
        """
        Execute advanced retrieval with multiple strategies and enhancements.
        Args:
            query: User's natural language query
            data: Optional data to search through
            **kwargs: Additional parameters
        Returns:
            Dict containing retrieved context and metadata
        """
        # session_id available for future use
        _ = kwargs.get("session_id", "default")
        user_id = kwargs.get("user_id")
        
        # Step 0: Extract parameters
        params = self._get_retrieval_params(**kwargs)
        params["user_id"] = user_id
        
        # Parse filters and boosts
        filters_dict = kwargs.get("filters", {})
        boosts_dict = kwargs.get("boosts", {})
        filters = RetrievalFilter(**filters_dict) if filters_dict else None
        boosts = RetrievalBoost(**boosts_dict) if boosts_dict else None
        params["filters"] = filters
        params["boosts"] = boosts
            
        # Step 1: Check cache
        cache_result = self._check_cache(
            query, 
            filters_dict, 
            user_id, 
            params["personalize"], 
            params["strategy"]
        )
        if cache_result:
            return cache_result
            
        try:
            logger.info(f"[{self.name}] Retrieving with strategy {params['strategy']} for: {query[:50]}")
            
            # Step 2: Retrieve initial candidates
            candidates = self._retrieve_candidates(
                query, 
                params["strategy"], 
                params["top_k"], 
                params["rerank"], 
                params["rerank_top_k"]
            )
            
            # Step 3: Apply filters if available
            if filters:
                candidates = self._apply_filters(candidates, filters)
            
            # Step 4: Augment with knowledge graph if enabled
            if params["use_kg"] and hasattr(self, '_knowledge_graph'):
                candidates = self._augment_with_kg(query, candidates)
            
            # Step 5: Process the candidates into final results
            # Start with candidates
            results = candidates
            
            # Apply reranking if needed
            if params["rerank"] and len(candidates) > params["top_k"]:
                results = self._cross_encoder_rerank(query, candidates, top_k=params["top_k"])
            
            # Apply boosting factors
            if boosts:
                results = self._apply_boosts(results, boosts)
            
            # Personalize if requested
            if params["personalize"] and user_id:
                results = self.personalize_results(results, user_id)
            
            # Truncate to top_k
            final_results = results[:params["top_k"]]
            
            # Step 6: Cache the results
            chunk_ids = [doc.get('id', '') for doc in final_results]
            self._retrieval_cache.set(
                self._hash_query(query, filters_dict), 
                final_results, 
                chunk_ids=chunk_ids,
                user_id=user_id if params["personalize"] else None
            )
                
            # Step 7: Return with metadata
            return {
                "context": final_results,
                "meta": self._create_result_metadata(params, candidates, final_results),
                "source": str(params["strategy"]),
                "cached": False
            }
            
        except Exception as e:
            logger.error(f"[{self.name}] Error during advanced retrieval: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            
            return {
                "error": f"Retrieval failed: {str(e)}",
                "context": None
            }
            
    def query_aware_chunking(self, text: str, query: str, chunk_size: int = 512, overlap: int = 50) -> List[DocumentChunk]:
        """
        Split text into chunks with query-aware boundaries.
        Keeps semantic units together based on query relevance.
        """
        chunks = []
        
        # In a real implementation, this would use more sophisticated chunking logic
        # based on semantic relevance to the query
        
        # Simple paragraph-based chunking for demonstration
        paragraphs = text.split("\n\n")
        current_chunk = ""
        current_start = 0
        
        for para in paragraphs:
            # If adding this paragraph exceeds chunk size and we already have content
            if len(current_chunk) + len(para) > chunk_size and current_chunk:
                # Create a chunk
                chunk = DocumentChunk(
                    document_id=hashlib.md5(text[:100].encode()).hexdigest(),
                    content=current_chunk,
                    start_idx=current_start,
                    end_idx=current_start + len(current_chunk)
                )
                chunks.append(chunk)
                
                # Start new chunk with overlap
                overlap_start = max(0, len(current_chunk) - overlap)
                current_chunk = current_chunk[overlap_start:] + "\n\n" + para
                current_start = current_start + overlap_start
            else:
                # Add to current chunk
                if current_chunk:
                    current_chunk += "\n\n" + para
                else:
                    current_chunk = para
        
        # Add the final chunk if it has content
        if current_chunk:
            chunk = DocumentChunk(
                document_id=hashlib.md5(text[:100].encode()).hexdigest(),
                content=current_chunk,
                start_idx=current_start,
                end_idx=current_start + len(current_chunk)
            )
            chunks.append(chunk)
        
        return chunks

    def run(self, query: str, data: Any = None, **kwargs) -> Dict[str, Any]:
        """
        Run the enhanced retrieval agent with all available capabilities.
        Args:
            query: User's question
            data: Data to search through
            **kwargs: Additional parameters
        Returns:
            Dict with retrieval results
        """
        return super().run(query, data, **kwargs)

# Import missing modules at the end to avoid circular imports
import uuid
