from typing import Any, Dict, Optional, List, Union, Callable, Type
import pandas as pd
import time
import inspect
import json
import uuid
import hashlib
from pydantic import BaseModel, Field, validator
from functools import wraps
import logging
from datetime import datetime, timedelta
from enum import Enum
from backend.core.logging import logger
from backend.core.tracing import traced

# Add OpenTelemetry imports for detailed tracing
# Set default value for OpenTelemetry availability
HAS_OPENTELEMETRY = False
Status = None
StatusCode = None
trace = None

try:
    import opentelemetry.trace as trace
    from opentelemetry.trace import Status, StatusCode
    HAS_OPENTELEMETRY = True
except ImportError:
    logger.warning("OpenTelemetry not installed. Advanced tracing disabled.")


class AgentEvent(str, Enum):
    """Events that can be emitted during agent lifecycle"""
    INIT = "init"
    PRE_PROCESS = "pre_process"
    EXECUTE_START = "execute_start"
    EXECUTE_END = "execute_end"
    POST_PROCESS = "post_process"
    ERROR = "error"
    COMPLETE = "complete"
    CACHE_HIT = "cache_hit"
    CACHE_MISS = "cache_miss"


class AgentMetrics(BaseModel):
    """Enhanced metrics for all agents with detailed performance tracking"""
    execution_time: float = Field(default=0.0)
    token_usage: Optional[Dict[str, int]] = Field(default=None)
    prompt_tokens: int = Field(default=0)
    completion_tokens: int = Field(default=0)
    total_tokens: int = Field(default=0)
    cache_hits: int = Field(default=0)
    cache_misses: int = Field(default=0)
    errors: int = Field(default=0)
    retry_count: int = Field(default=0)
    memory_usage: Optional[float] = Field(default=None)
    start_timestamp: Optional[str] = Field(default=None)
    end_timestamp: Optional[str] = Field(default=None)
    
    def update_token_usage(self, usage: Dict[str, int]):
        """Update token usage metrics from LLM response"""
        if not usage:
            return
        
        self.prompt_tokens = usage.get("prompt_tokens", self.prompt_tokens)
        self.completion_tokens = usage.get("completion_tokens", self.completion_tokens)
        self.total_tokens = usage.get("total_tokens", self.total_tokens)
        self.token_usage = usage
    
    def start_timer(self):
        """Start execution timer"""
        self.start_timestamp = datetime.now().isoformat()
        
    def end_timer(self):
        """End execution timer and calculate duration"""
        self.end_timestamp = datetime.now().isoformat()
        if self.start_timestamp:
            start = datetime.fromisoformat(self.start_timestamp)
            end = datetime.fromisoformat(self.end_timestamp)
            self.execution_time = (end - start).total_seconds()


class CachePolicy(str, Enum):
    """Cache policies for agent results"""
    NONE = "none"  # No caching
    TIME = "time"  # Time-based invalidation
    QUERY = "query"  # Query-based caching
    HYBRID = "hybrid"  # Both time and query based


class AgentConfig(BaseModel):
    """Enhanced configuration with runtime update capabilities"""
    temperature: float = Field(default=0.7)
    max_tokens: int = Field(default=1000)
    model: str = Field(default="gpt-4")
    cache_results: bool = Field(default=True)
    cache_policy: CachePolicy = Field(default=CachePolicy.HYBRID)
    cache_ttl: int = Field(default=3600)  # Cache time-to-live in seconds
    retry_attempts: int = Field(default=3)
    retry_delay: float = Field(default=1.0)  # Delay between retries in seconds
    enable_tracing: bool = Field(default=True)
    log_level: str = Field(default="INFO")
    timeout: Optional[float] = Field(default=30.0)  # Execution timeout in seconds
    
    @validator('temperature')
    def validate_temperature(cls, v):
        if v < 0 or v > 1:
            raise ValueError(f"Temperature must be between 0 and 1, got {v}")
        return v
    
    @validator('log_level')
    def validate_log_level(cls, v):
        valid_levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        if v not in valid_levels:
            raise ValueError(f"Log level must be one of {valid_levels}, got {v}")
        return v


class AgentCache:
    """Multi-level caching system for agent results"""
    def __init__(self, policy: CachePolicy = CachePolicy.HYBRID, ttl: int = 3600):
        self._cache = {}
        self.policy = policy
        self.ttl = ttl
        self.hits = 0
        self.misses = 0
    
    def _generate_key(self, query: str, data_hash: str, **kwargs) -> str:
        """Generate a unique cache key based on query and data"""
        # Create a deterministic representation of kwargs
        kwargs_str = json.dumps(kwargs, sort_keys=True) if kwargs else ""
        key_content = f"{query}:{data_hash}:{kwargs_str}"
        return hashlib.md5(key_content.encode()).hexdigest()
    
    def _hash_dataframe(self, df: pd.DataFrame) -> str:
        """Create a hash representing dataframe content"""
        if df is None or df.empty:
            return "empty_df"
        try:
            # Use pandas hash function for efficiency
            return str(hash(pd.util.hash_pandas_object(df).sum()))
        except Exception:
            # Fallback to string representation hash
            return hashlib.md5(str(df.head()).encode()).hexdigest()
    
    def get(self, query: str, data: pd.DataFrame, **kwargs) -> Optional[Dict]:
        """Get cached result if available and valid"""
        if self.policy == CachePolicy.NONE:
            self.misses += 1
            return None
            
        data_hash = self._hash_dataframe(data)
        cache_key = self._generate_key(query, data_hash, **kwargs)
        
        if cache_key not in self._cache:
            self.misses += 1
            return None
        
        cached_item = self._cache[cache_key]
        
        # Check time validity for time-based policies
        if self.policy in [CachePolicy.TIME, CachePolicy.HYBRID]:
            current_time = time.time()
            if current_time - cached_item.get("timestamp", 0) > self.ttl:
                self.misses += 1
                return None
        
        self.hits += 1
        return cached_item.get("result")
    
    def set(self, query: str, data: pd.DataFrame, result: Dict, **kwargs):
        """Cache a result"""
        if self.policy == CachePolicy.NONE:
            return
            
        data_hash = self._hash_dataframe(data)
        cache_key = self._generate_key(query, data_hash, **kwargs)
        
        self._cache[cache_key] = {
            "timestamp": time.time(),
            "result": result
        }
    
    def clear(self):
        """Clear all cached results"""
        self._cache = {}
        
    def clear_expired(self):
        """Clear expired cache entries"""
        if self.policy in [CachePolicy.TIME, CachePolicy.HYBRID]:
            current_time = time.time()
            expired_keys = [
                key for key, item in self._cache.items() 
                if current_time - item.get("timestamp", 0) > self.ttl
            ]
            for key in expired_keys:
                del self._cache[key]
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        return {
            "size": len(self._cache),
            "hits": self.hits,
            "misses": self.misses,
            "hit_ratio": self.hits / (self.hits + self.misses) if (self.hits + self.misses) > 0 else 0,
            "policy": self.policy,
            "ttl": self.ttl
        }


class BaseAgent:
    name: str = "BaseAgent"
    role: str = "Base agent for all specialized agents."
    _config: Optional[AgentConfig] = None
    _metrics: AgentMetrics = AgentMetrics()
    
    # Event handlers
    _event_handlers: Dict[AgentEvent, List[Callable]] = {}
    
    # Cache system
    _cache: Optional[AgentCache] = None

    def __init__(self, config: Optional[Union[Dict, AgentConfig]] = None):
        """
        Initialize BaseAgent with optional configuration.
        Args:
            config: Configuration for the agent's behavior
        """
        # Generate a unique ID for this agent instance
        self._agent_id = str(uuid.uuid4())
        
        # Initialize config
        if config:
            if isinstance(config, dict):
                self._config = AgentConfig(**config)
            else:
                self._config = config
        else:
            self._config = AgentConfig()
        
        # Set up metrics
        self._metrics = AgentMetrics()
        
        # Initialize cache if enabled
        if self._config.cache_results:
            self._cache = AgentCache(
                policy=self._config.cache_policy,
                ttl=self._config.cache_ttl
            )
        else:
            self._cache = AgentCache(policy=CachePolicy.NONE)
            
        # Set up context for the agent
        self._context = {}
        
        # Configure logging based on config
        self._configure_logging()
        
        # Initialize event handlers dictionary
        self._event_handlers = {event: [] for event in AgentEvent}
        
        # Emit initialization event
        self._emit_event(AgentEvent.INIT, {"agent_id": self._agent_id, "config": self._config.dict()})
        
        logger.info(f"[{self.name}] Initialized with ID {self._agent_id} and config: {self._config}")
    
    def _configure_logging(self):
        """Configure logging based on agent configuration"""
        log_level = getattr(logging, self._config.log_level, logging.INFO)
        logger.setLevel(log_level)
    
    @property
    def config(self) -> AgentConfig:
        """Access the agent's configuration"""
        if not self._config:
            self._config = AgentConfig()
        return self._config
    
    @config.setter
    def config(self, config: Union[Dict, AgentConfig]):
        """Set the agent's configuration"""
        if isinstance(config, dict):
            self._config = AgentConfig(**config)
        else:
            self._config = config
        
        # Reconfigure logging if level changed
        self._configure_logging()
        
        # Update cache if cache settings changed
        if self._cache:
            self._cache.policy = self._config.cache_policy
            self._cache.ttl = self._config.cache_ttl
        
    @property
    def metrics(self) -> Dict[str, Any]:
        """Get the agent's metrics as a dictionary"""
        return self._metrics.dict()
    
    def on(self, event: AgentEvent, handler: Callable):
        """Register an event handler for a specific agent lifecycle event"""
        if event in self._event_handlers:
            self._event_handlers[event].append(handler)
        return self  # Allow chaining
    
    def _emit_event(self, event: AgentEvent, data: Dict[str, Any] = None):
        """Emit an event to all registered handlers"""
        if not data:
            data = {}
            
        # Add standard event metadata
        event_data = {
            "event": event,
            "agent": self.name,
            "agent_id": self._agent_id,
            "timestamp": datetime.now().isoformat(),
            **data
        }
        
        # Call all registered handlers for this event
        for handler in self._event_handlers.get(event, []):
            try:
                handler(event_data)
            except Exception as e:
                logger.error(f"Error in event handler for {event}: {str(e)}")
    
    def pre_process(self, query: str, data: Any, **kwargs) -> Dict[str, Any]:
        """
        Pre-processing hook executed before main logic.
        Args:
            query: The user's question
            data: The data to process
            **kwargs: Additional context
        Returns:
            Dict with preprocessing results
        """
        caller = inspect.currentframe().f_back.f_code.co_name if inspect.currentframe().f_back else "unknown"
        logger.info(f"[{self.name}] {caller} called with query: {query[:50]}{'...' if len(query) > 50 else ''}")
        
        # Emit pre-process event
        self._emit_event(AgentEvent.PRE_PROCESS, {"query": query})
        
        # Start metrics timer
        self._metrics.start_timer()
        
        return {"query": query, "data": data, **kwargs}
    
    def post_process(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Post-processing hook executed after main logic.
        Args:
            result: The result from the agent's processing
        Returns:
            Dict with post-processed results
        """
        # End metrics timer
        self._metrics.end_timer()
        
        # Emit post-process event
        self._emit_event(AgentEvent.POST_PROCESS, {"result": result})
        
        return result
    
    def handle_error(self, error: Exception, query: str, context: Dict) -> Dict[str, Any]:
        """
        Enhanced error handling with recovery mechanisms.
        Args:
            error: The exception that occurred
            query: The original query
            context: The context at the time of the error
        Returns:
            Dict with error information and fallback response if available
        """
        logger.error(f"[{self.name}] Error processing query: {str(error)}")
        import traceback
        logger.error(traceback.format_exc())
        
        # Increment error count in metrics
        self._metrics.errors += 1
        
        # Emit error event
        self._emit_event(
            AgentEvent.ERROR, 
            {"error": str(error), "traceback": traceback.format_exc(), "query": query}
        )
        
        # Try to determine most appropriate recovery action based on error type
        recovery_action = self._determine_recovery_action(error)
        
        return {
            "agent": self.name,
            "role": self.role,
            "error": str(error),
            "success": False,
            "recovery_action": recovery_action,
            "fallback_response": f"I encountered an error while processing your request: {str(error)}",
            "query": query
        }
    
    def _determine_recovery_action(self, error: Exception) -> Dict[str, Any]:
        """
        Determine appropriate recovery action based on error type.
        This is part of the adaptive error recovery system.
        """
        error_type = type(error).__name__
        
        # Define recovery strategies based on error type
        if "Timeout" in error_type:
            return {
                "action": "retry",
                "message": "The operation timed out. Try with a simpler query or more time.",
                "suggested_params": {"timeout": self._config.timeout * 1.5 if self._config.timeout else 45.0}
            }
        elif "Memory" in error_type or "Resource" in error_type:
            return {
                "action": "simplify",
                "message": "The operation exceeded available resources. Try with a smaller dataset or simpler query."
            }
        elif "Authentication" in error_type or "Permission" in error_type:
            return {
                "action": "credentials",
                "message": "There was an authentication or permission issue. Check your credentials and permissions."
            }
        elif "Value" in error_type or "Type" in error_type:
            return {
                "action": "validate",
                "message": "There was an issue with the input data. Check the data format and try again."
            }
        else:
            return {
                "action": "retry",
                "message": "An unexpected error occurred. Try again or contact support."
            }
    
    def _check_cache(self, query: str, data: pd.DataFrame, **kwargs) -> Optional[Dict[str, Any]]:
        """Check if we have a cached result for this query and data"""
        if not self._cache or not self._config.cache_results:
            return None
            
        cached_result = self._cache.get(query, data, **kwargs)
        if cached_result:
            # Update metrics for cache hit
            self._metrics.cache_hits += 1
            
            # Emit cache hit event
            self._emit_event(AgentEvent.CACHE_HIT, {
                "query": query, 
                "cache_stats": self._cache.get_stats()
            })
            
            logger.debug(f"[{self.name}] Cache hit for query: {query[:30]}...")
            
            # Return cached result with cache metadata
            cached_result["cache"] = {
                "hit": True,
                "timestamp": datetime.now().isoformat()
            }
            return cached_result
        else:
            # Update metrics for cache miss
            self._metrics.cache_misses += 1
            
            # Emit cache miss event
            self._emit_event(AgentEvent.CACHE_MISS, {
                "query": query
            })
            
            logger.debug(f"[{self.name}] Cache miss for query: {query[:30]}...")
            return None
    
    def _setup_tracing(self, query: str) -> Optional[Any]:
        """Setup OpenTelemetry tracing for the request if enabled"""
        if not HAS_OPENTELEMETRY or not self._config.enable_tracing:
            return None
            
        # Get the current span from the tracer
        current_span = trace.get_current_span()
        current_span.set_attribute("agent.name", self.name)
        current_span.set_attribute("agent.query", query[:100])  # First 100 chars of query
        return current_span
    
    def _execute_with_timeout(self, query: str, data: pd.DataFrame, context: Dict) -> Dict[str, Any]:
        """Execute the agent logic with timeout handling if configured"""
        if not self._config.timeout:
            # Regular execution without timeout
            return self._execute(query, data, **context)
        
        # For async execution with timeout
        try:
            import asyncio
            from concurrent.futures import ThreadPoolExecutor
            
            # Execute in thread pool with timeout
            with ThreadPoolExecutor() as executor:
                future = executor.submit(self._execute, query, data, **context)
                result = asyncio.run(asyncio.wait_for(
                    asyncio.get_event_loop().run_in_executor(
                        None, lambda future=future: future.result()
                    ),
                    timeout=self._config.timeout
                ))
            return result
        except asyncio.TimeoutError:
            raise TimeoutError(f"Execution timed out after {self._config.timeout} seconds")
    
    def _handle_success(self, 
                       query: str, 
                       data: pd.DataFrame, 
                       final_result: Dict[str, Any], 
                       start_time: float,
                       retry_count: int,
                       current_span: Any,
                       **kwargs) -> Dict[str, Any]:
        """Handle successful execution and prepare response"""
        # Update metrics
        self._metrics.execution_time = time.time() - start_time
        self._metrics.retry_count = retry_count
        
        # Update token usage if available
        if "token_usage" in final_result:
            self._metrics.update_token_usage(final_result.get("token_usage", {}))
        
        # Prepare final response
        response = {
            "agent": self.name,
            "role": self.role,
            "output": final_result,
            "metrics": self._metrics.dict(),
            "success": True
        }
        
        # If OpenTelemetry is available, set span status
        if HAS_OPENTELEMETRY and self._config.enable_tracing and current_span:
            current_span.set_status(Status(StatusCode.OK))
            
        # Cache successful result if caching is enabled
        if self._cache and self._config.cache_results:
            self._cache.set(query, data, response, **kwargs)
        
        # Emit completion event
        self._emit_event(AgentEvent.COMPLETE, {
            "success": True,
            "metrics": self._metrics.dict()
        })
        
        return response
    
    @traced(name="agent_run")
    def run(self, query: str, data: pd.DataFrame = None, **kwargs) -> Dict[str, Any]:
        """
        Enhanced run method with caching, retry logic, and comprehensive metrics.
        Args:
            query: The user's question
            data: The data to operate on
            **kwargs: Additional parameters
        Returns:
            Dict with structured output from the agent
        """
        # Initialize retry counter
        retry_count = 0
        max_retries = self._config.retry_attempts
        
        # Check cache first if enabled
        cached_result = self._check_cache(query, data, **kwargs)
        if cached_result:
            return cached_result
        
        # Start timing
        start_time = time.time()
        
        # Setup tracing if enabled
        current_span = self._setup_tracing(query)
        
        while retry_count <= max_retries:
            try:
                # Pre-processing
                context = self.pre_process(query, data, **kwargs)
                
                # Emit execute start event
                self._emit_event(AgentEvent.EXECUTE_START, {"context": context})
                
                # Execute main logic with timeout if configured
                result = self._execute_with_timeout(query, data, context)
                
                # Emit execute end event
                self._emit_event(AgentEvent.EXECUTE_END, {"raw_result": result})
                
                # Post-processing
                final_result = self.post_process(result)
                
                # Handle successful execution
                return self._handle_success(
                    query, data, final_result, start_time, retry_count, current_span, **kwargs
                )
                
            except Exception as e:
                retry_count += 1
                self._metrics.retry_count = retry_count
                
                # If OpenTelemetry is available, set span status to error
                if HAS_OPENTELEMETRY and self._config.enable_tracing and current_span:
                    current_span.set_status(Status(StatusCode.ERROR, str(e)))
                    current_span.record_exception(e)
                
                # If we've hit the retry limit, handle the error properly
                if retry_count > max_retries:
                    return self.handle_error(e, query, kwargs)
                
                # Otherwise, wait and retry
                logger.warning(f"[{self.name}] Retry {retry_count}/{max_retries} after error: {str(e)}")
                time.sleep(self._config.retry_delay * retry_count)  # Exponential backoff
    
    def _execute(self, query: str, data: pd.DataFrame, **kwargs) -> Dict[str, Any]:
        """
        Core execution logic to be implemented by subclasses.
        Args:
            query: The user's question
            data: The data to operate on
            **kwargs: Additional parameters
        Returns:
            Dict: Result of the agent's processing
        """
        raise NotImplementedError("Each agent must implement its own _execute() method.")
    
    def health_check(self) -> Dict[str, Any]:
        """
        Check the health status of the agent.
        Returns:
            Dict with health information
        """
        return {
            "status": "healthy",
            "agent": self.name,
            "agent_id": self._agent_id,
            "cache": self._cache.get_stats() if self._cache else None,
            "metrics": self._metrics.dict(),
            "timestamp": datetime.now().isoformat()
        }
    
    def export_schema(self) -> Dict[str, Any]:
        """
        Export the agent's interface schema for documentation and integration.
        Returns:
            Dict with agent schema information
        """
        return {
            "name": self.name,
            "role": self.role,
            "config_schema": self._config.schema() if self._config else None,
            "inputs": {
                "query": "string",
                "data": "pandas.DataFrame",
            },
            "outputs": {
                "agent": "string",
                "role": "string",
                "output": "Dict[str, Any]",
                "metrics": "Dict[str, Any]",
                "success": "bool"
            }
        }
