import io
import asyncio
from concurrent.futures import ThreadPoolExecutor
from backend.core.io import save_files, delete_files
from backend.core.loader import load_and_split
from backend.core.llm_rag import upsert_documents_batch
from backend.core.logging import logger

def create_vector_store(files: list[io.BytesIO], name: str):
    data_source = save_files(files, name)
    docs = load_and_split(data_source)
    ids = [f"{name}_{i}" for i in range(len(docs))]
    texts = [doc.page_content for doc in docs]
    upsert_documents_batch(ids, texts)
    delete_files(files, name)
    logger.info(f"Vector store created for {name}")
    return True

def create_vector_store_async(files: list[io.BytesIO], name: str, chunk_size=None, chunk_overlap_pct=None, splitter_type=None):
    loop = asyncio.get_event_loop()
    return loop.run_in_executor(None, create_vector_store, files, name)

async def batch_upsert_async(ids, texts, batch_size=500):
    with ThreadPoolExecutor() as executor:
        loop = asyncio.get_event_loop()
        tasks = []
        for i in range(0, len(ids), batch_size):
            batch_ids = ids[i:i+batch_size]
            batch_texts = texts[i:i+batch_size]
            tasks.append(loop.run_in_executor(executor, upsert_documents_batch, batch_ids, batch_texts))
        await asyncio.gather(*tasks)
