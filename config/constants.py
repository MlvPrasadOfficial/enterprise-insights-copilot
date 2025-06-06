from pathlib import Path

# Paths
MODEL_PATH = Path("models")
DATA_PATH = Path("data")
VECTOR_STORE_PATH = Path("stores")

# Embedding/LLM
TEMPERATURE = 0.0
MAX_TOKENS = 2560
MAXIMAL_MARGINAL_RELEVANCE = True
DISTANCE_METRIC = "cos"
K_FETCH_K_RATIO = 5

# Logging
VERBOSE = False

# Chunking and loader config
CHUNK_SIZE = 512
CHUNK_OVERLAP_PCT = 15

# Model/embedding config
OPENAI_EMBEDDING_MODEL = "text-embedding-ada-002"

# Splitter types
DEFAULT_SPLITTER_TYPE = "default"
SMART_FAQ_SPLITTER_TYPE = "smart_faq"

# Allow runtime override via API/frontend (documented for use)
RUNTIME_OVERRIDABLE_CONFIG = [
    "CHUNK_SIZE",
    "CHUNK_OVERLAP_PCT",
    "OPENAI_EMBEDDING_MODEL",
    "DEFAULT_SPLITTER_TYPE",
    "SMART_FAQ_SPLITTER_TYPE",
]
