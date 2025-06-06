import os
from pathlib import Path
import pandas as pd
from typing import List, Any
from tqdm import tqdm
from config.constants import CHUNK_SIZE, CHUNK_OVERLAP_PCT

try:
    from langchain_community.document_loaders import CSVLoader, TextLoader, PyPDFium2Loader, UnstructuredWordDocumentLoader
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain.schema import Document
except ImportError:
    # Fallback: define a minimal Document for CSV/TXT
    class Document:
        def __init__(self, page_content, metadata=None):
            self.page_content = page_content
            self.metadata = metadata or {}

# File loader mapping (extensible)
FILE_LOADER_MAPPING = {
    ".csv": (CSVLoader, {"encoding": "utf-8"}),
    ".txt": (TextLoader, {"encoding": "utf-8"}),
    ".pdf": (PyPDFium2Loader, {}),
    ".doc": (UnstructuredWordDocumentLoader, {}),
    ".docx": (UnstructuredWordDocumentLoader, {}),
    # Add more mappings for other file types as needed
}

def load_document(file_path: str, mapping: dict = FILE_LOADER_MAPPING) -> List[Any]:
    ext = "." + file_path.rsplit(".", 1)[-1].lower()
    if ext in mapping:
        loader_class, loader_args = mapping[ext]
        loader = loader_class(file_path, **loader_args)
        return loader.load()
    # Fallback: try pandas for CSV, TXT
    if ext == ".csv":
        df = pd.read_csv(file_path)
        return [Document(row.to_json(), {"row": i}) for i, row in df.iterrows()]
    elif ext == ".txt":
        with open(file_path, encoding="utf-8") as f:
            return [Document(f.read(), {"file": file_path})]
    elif ext == ".pdf":
        try:
            from PyPDF2 import PdfReader
            reader = PdfReader(file_path)
            text = "\n".join(page.extract_text() or "" for page in reader.pages)
            return [Document(text, {"file": file_path})]
        except Exception as e:
            raise ValueError(f"PDF loading failed: {e}")
    else:
        raise ValueError(f"Unsupported file type: {ext}")

def load_directory(path: str, silent_errors=True) -> List[Any]:
    all_files = list(Path(path).rglob("**/[!.]*"))
    results = []
    with tqdm(total=len(all_files), desc="Loading documents", ncols=80) as pbar:
        for file in all_files:
            try:
                results.extend(load_document(str(file)))
            except Exception as e:
                if silent_errors:
                    print(f"[Loader] Failed to load {file}: {e}")
                else:
                    raise e
            pbar.update()
    return results

def split_documents(docs: List[Any], chunk_size: int = CHUNK_SIZE, chunk_overlap_pct: int = CHUNK_OVERLAP_PCT) -> List[Any]:
    # Use RecursiveCharacterTextSplitter if available, else fallback to simple split
    try:
        chunk_overlap = int(chunk_size * chunk_overlap_pct / 100)
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ".", "!", "?", ",", " ", ""]
        )
        return splitter.split_documents(docs)
    except Exception:
        # Fallback: no split
        return docs

def load_and_split(file_path: str) -> List[Any]:
    docs = load_document(file_path)
    return split_documents(docs)
