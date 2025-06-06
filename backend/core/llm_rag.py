import os
from pinecone import Pinecone
from dotenv import load_dotenv
from typing import List
from backend.core.models import get_openai_client
from backend.core.prompts import RAG_PROMPT
from backend.core.utils import clean_string_for_storing
from backend.core.logging import logger
from config.constants import CHUNK_SIZE, MAX_TOKENS
from tqdm import tqdm
from concurrent.futures import ThreadPoolExecutor, as_completed
import time
import openai

# Vector store abstraction for future extensibility
class VectorStore:
    def __init__(self, backend="pinecone", **kwargs):
        if backend == "pinecone":
            self.index = kwargs.get("index")
        else:
            raise NotImplementedError("Only Pinecone backend is currently supported.")

    def upsert(self, vectors):
        self.index.upsert(vectors=vectors)

    def query(self, vector, top_k=5, include_metadata=True):
        return self.index.query(vector=vector, top_k=top_k, include_metadata=include_metadata)


try:
    import tiktoken
except ImportError:
    raise ImportError("tiktoken is required for batching embeddings. Please install with 'pip install tiktoken'.")

print("[DEBUG] Importing backend/core/llm_rag.py...")
load_dotenv()
print("[DEBUG] Loaded .env and set OpenAI key...")

if not os.getenv("PINECONE_API_KEY"):
    print("[DEBUG] Missing PINECONE_API_KEY!")
    raise RuntimeError("Missing PINECONE_API_KEY")

# Initialize Pinecone v3.x
print("[DEBUG] Initializing Pinecone client...")
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
INDEX_NAME = "enterprisenew"

# Pinecone v3.x: list_indexes returns a dict with 'indexes' key
print("[DEBUG] Listing Pinecone indexes...")
index_names = [idx['name'] for idx in pc.list_indexes().get('indexes', [])]
if INDEX_NAME not in index_names:
    print(f"[DEBUG] Pinecone index '{INDEX_NAME}' does not exist!")
    raise RuntimeError(
        f"Pinecone index '{INDEX_NAME}' does not exist. Please create it manually in the Pinecone dashboard "
        "with the correct embedding model and dimensions."
    )
print("[DEBUG] Connecting to Pinecone index...")
index = pc.Index(INDEX_NAME)
vector_store = VectorStore(backend="pinecone", index=index)
print("[DEBUG] Pinecone index connected.")

def retry_with_backoff(func, max_retries=5, initial_delay=1, backoff_factor=2, exceptions=(Exception,)):
    delay = initial_delay
    for attempt in range(max_retries):
        try:
            return func()
        except exceptions as e:
            logger.warning(f"Retry {attempt+1}/{max_retries} after error: {e}")
            if attempt == max_retries - 1:
                raise
            time.sleep(delay)
            delay *= backoff_factor

def embed_text(text: str) -> List[float]:
    client = get_openai_client()
    def call():
        response = client.embeddings.create(
            model="text-embedding-ada-002",
            input=[text]
        )
        return response.data[0].embedding
    return retry_with_backoff(call, exceptions=(openai.RateLimitError, openai.APIError, Exception))


def upsert_document(doc_id: str, text: str):
    vector = embed_text(text)
    def call():
        vector_store.upsert([{"id": doc_id, "values": vector, "metadata": {"text": text}}])
    retry_with_backoff(call, exceptions=(Exception,))


def retrieve_relevant_chunks(query: str, top_k: int = 5):
    vector = embed_text(query)
    results = vector_store.query(vector=vector, top_k=top_k, include_metadata=True)
    return [match["metadata"]["text"] for match in results["matches"]]


def run_rag(query: str) -> str:
    chunks = retrieve_relevant_chunks(query)
    context = "\n".join(chunks)
    prompt = RAG_PROMPT.format(context=context, query=query)
    client = get_openai_client()
    completion = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )
    return completion.choices[0].message.content.strip()


def embed_text_batch(texts: list, batch_size: int = 500) -> list:
    # Ensure all are non-empty, single-line strings and batch size <= batch_size
    clean_texts = []
    for t in texts:
        if t is None:
            continue
        s = str(t).replace('\n', ' ').replace('\r', ' ').strip()
        if s:
            clean_texts.append(s)
    if not clean_texts:
        print("[DEBUG] No valid texts to embed.")
        return []
    # Limit batch size to batch_size for reliability
    results = []
    total = len(clean_texts)
    client = get_openai_client()
    for i in range(0, total, batch_size):
        batch = clean_texts[i:i+batch_size]
        print(f"[DEBUG] Sending batch {i//batch_size+1} ({i+1}-{min(i+batch_size, total)}) of {((total-1)//batch_size)+1} to OpenAI embeddings: batch size: {len(batch)}")
        response = client.embeddings.create(
            model="text-embedding-ada-002",
            input=batch
        )
        results.extend([item.embedding for item in response.data])
    return results


def embed_text_batch_parallel(texts: list, batch_size: int = 500, max_workers: int = 4) -> list:
    clean_texts = [str(t).replace('\n', ' ').replace('\r', ' ').strip() for t in texts if t and str(t).strip()]
    batches = [clean_texts[i:i+batch_size] for i in range(0, len(clean_texts), batch_size)]
    results = [None] * len(batches)
    def embed_batch(idx, batch):
        client = get_openai_client()
        response = client.embeddings.create(model="text-embedding-ada-002", input=batch)
        return idx, [item.embedding for item in response.data]
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(embed_batch, i, batch) for i, batch in enumerate(batches)]
        for f in tqdm(as_completed(futures), total=len(futures), desc="Embedding batches"):
            idx, embeddings = f.result()
            results[idx] = embeddings
    return [emb for batch in results if batch for emb in batch]


def batch_by_token_limit(texts, max_tokens=100000):
    enc = tiktoken.get_encoding("cl100k_base")
    batches = []
    current_batch = []
    current_tokens = 0
    for text in texts:
        tokens = len(enc.encode(text))
        if current_tokens + tokens > max_tokens and current_batch:
            batches.append(current_batch)
            current_batch = []
            current_tokens = 0
        current_batch.append(text)
        current_tokens += tokens
    if current_batch:
        batches.append(current_batch)
    return batches


MAX_PINECONE_BATCH_SIZE = 100  # Pinecone recommends small batches, and 100 is well below the 4MB limit
MAX_PINECONE_MESSAGE_BYTES = 4 * 1024 * 1024  # 4MB

def upsert_documents_batch(ids: list, texts: list):
    # Split into batches by token limit and by Pinecone batch size
    max_tokens = 100000  # well below OpenAI's 300k limit for safety
    text_batches = batch_by_token_limit(texts, max_tokens)
    idx = 0
    for batch in text_batches:
        # Further split by Pinecone batch size
        for j in range(0, len(batch), MAX_PINECONE_BATCH_SIZE):
            pinecone_batch = batch[j:j+MAX_PINECONE_BATCH_SIZE]
            batch_ids = ids[idx:idx+len(pinecone_batch)]
            embeddings = embed_text_batch(pinecone_batch, batch_size=MAX_PINECONE_BATCH_SIZE)
            vectors = []
            for doc_id, text, vector in zip(batch_ids, pinecone_batch, embeddings):
                vectors.append({"id": doc_id, "values": vector, "metadata": {"text": text}})
            # Check message size before upsert
            import json
            message_bytes = len(json.dumps(vectors).encode('utf-8'))
            if message_bytes > MAX_PINECONE_MESSAGE_BYTES:
                print(f"[ERROR] Pinecone upsert batch too large: {message_bytes} bytes. Skipping this batch.")
                continue
            vector_store.upsert(vectors=vectors)
            idx += len(pinecone_batch)
