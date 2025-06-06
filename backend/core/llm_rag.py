import os
import openai
from pinecone import Pinecone
from dotenv import load_dotenv
from typing import List
from config.settings import load_prompt
try:
    import tiktoken
except ImportError:
    raise ImportError("tiktoken is required for batching embeddings. Please install with 'pip install tiktoken'.")

print("[DEBUG] Importing backend/core/llm_rag.py...")
load_dotenv()
print("[DEBUG] Loaded .env and set OpenAI key...")
openai.api_key = os.getenv("OPENAI_API_KEY")

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
print("[DEBUG] Pinecone index connected.")


def embed_text(text: str) -> List[float]:
    response = openai.embeddings.create(
        model="text-embedding-ada-002",  # Changed to match Pinecone index dimension 1536
        input=[text]
    )
    return response.data[0].embedding


def upsert_document(doc_id: str, text: str):
    vector = embed_text(text)
    index.upsert(vectors=[{"id": doc_id, "values": vector, "metadata": {"text": text}}])


def retrieve_relevant_chunks(query: str, top_k: int = 5):
    vector = embed_text(query)
    results = index.query(vector=vector, top_k=top_k, include_metadata=True)
    return [match["metadata"]["text"] for match in results["matches"]]


def run_rag(query: str) -> str:
    chunks = retrieve_relevant_chunks(query)
    context = "\n".join(chunks)
    template = load_prompt("config/prompts/rag_prompt.txt")
    prompt = template.format(context=context, query=query)

    completion = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )
    return completion.choices[0].message.content.strip()


def embed_text_batch(texts: list) -> list:
    response = openai.embeddings.create(
        model="text-embedding-ada-002",
        input=texts
    )
    return [item.embedding for item in response.data]


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


def upsert_documents_batch(ids: list, texts: list):
    # Split into batches by token limit
    max_tokens = 100000  # well below OpenAI's 300k limit for safety
    text_batches = batch_by_token_limit(texts, max_tokens)
    idx = 0
    for batch in text_batches:
        batch_ids = ids[idx:idx+len(batch)]
        embeddings = embed_text_batch(batch)
        vectors = []
        for doc_id, text, vector in zip(batch_ids, batch, embeddings):
            vectors.append({"id": doc_id, "values": vector, "metadata": {"text": text}})
        index.upsert(vectors=vectors)
        idx += len(batch)
