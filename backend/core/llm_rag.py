import os
import openai
from pinecone import Pinecone
from dotenv import load_dotenv
from typing import List
from config.settings import load_prompt

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

if not os.getenv("PINECONE_API_KEY"):
    raise RuntimeError("Missing PINECONE_API_KEY")

# Initialize Pinecone v3.x
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
INDEX_NAME = "enterprisenew"

# Pinecone v3.x: list_indexes returns a dict with 'indexes' key
index_names = [idx['name'] for idx in pc.list_indexes().get('indexes', [])]
if INDEX_NAME not in index_names:
    raise RuntimeError(
        f"Pinecone index '{INDEX_NAME}' does not exist. Please create it manually in the Pinecone dashboard "
        "with the correct embedding model and dimensions."
    )
index = pc.Index(INDEX_NAME)


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
