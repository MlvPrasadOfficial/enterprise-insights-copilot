import io
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
