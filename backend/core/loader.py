import os
from pathlib import Path
import pandas as pd
from typing import List, Any
from tqdm import tqdm
from config.constants import CHUNK_SIZE, CHUNK_OVERLAP_PCT

try:
    from langchain_community.document_loaders import (
        CSVLoader, TextLoader, PyPDFium2Loader, UnstructuredWordDocumentLoader,
        UnstructuredMarkdownLoader, UnstructuredHTMLLoader, UnstructuredPowerPointLoader, NotebookLoader
    )
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
    ".md": (UnstructuredMarkdownLoader, {}),
    ".markdown": (UnstructuredMarkdownLoader, {}),
    ".html": (UnstructuredHTMLLoader, {}),
    ".htm": (UnstructuredHTMLLoader, {}),
    ".pptx": (UnstructuredPowerPointLoader, {}),
    ".ipynb": (NotebookLoader, {}),
    # Add more mappings for other file types as needed
}

def load_document(file_path: str, mapping: dict = FILE_LOADER_MAPPING) -> List[Any]:
    ext = "." + file_path.rsplit(".", 1)[-1].lower()
    if ext in mapping:
        loader_class, loader_args = mapping[ext]
        try:
            loader = loader_class(file_path, **loader_args)
            return loader.load()
        except Exception as e:
            print(f"[Loader] {ext} loader failed: {e}. Trying pandas fallback.")
            if ext == ".csv":
                with open(file_path, encoding="utf-8") as f:
                    raw = f.read()
                    print(f"[Loader DEBUG] Raw CSV content (first 200 chars): {raw[:200]}")
                try:
                    df = pd.read_csv(file_path)
                    return [Document(row.to_json(), {"row": i}) for i, row in df.iterrows()]
                except Exception as pandas_e:
                    print(f"[Loader ERROR] pandas.read_csv failed: {pandas_e}")
                    raise
    # Fallback: try pandas for CSV, TXT
    if ext == ".csv":
        with open(file_path, encoding="utf-8") as f:
            raw = f.read()
            print(f"[Loader DEBUG] Raw CSV content (first 200 chars): {raw[:200]}")
        try:
            df = pd.read_csv(file_path)
            return [Document(row.to_json(), {"row": i}) for i, row in df.iterrows()]
        except Exception as pandas_e:
            print(f"[Loader ERROR] pandas.read_csv failed: {pandas_e}")
            raise
    elif ext == ".txt":
        with open(file_path, encoding="utf-8") as f:
            content = f.read()
            return [Document(content, {"file": file_path})]
    elif ext == ".pdf":
        raise ValueError(f"PDF loading failed for {file_path}. Please ensure PyPDFium2Loader is installed and working.")
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

class SmartFAQSplitter:
    """Splits FAQ-style documents into Q&A pairs or logical chunks."""
    def __init__(self, question_prefixes=None, chunk_size=CHUNK_SIZE, chunk_overlap_pct=CHUNK_OVERLAP_PCT):
        self.question_prefixes = question_prefixes or ["Q:", "Question:", "Q.", "Q -", "Q-"]
        self.chunk_size = chunk_size
        self.chunk_overlap = int(chunk_size * chunk_overlap_pct / 100)

    def split(self, docs):
        split_docs = []
        for doc in docs:
            lines = doc.page_content.splitlines()
            current = []
            for line in lines:
                if any(line.strip().startswith(q) for q in self.question_prefixes):
                    if current:
                        split_docs.append(Document("\n".join(current), doc.metadata))
                        current = []
                current.append(line)
            if current:
                split_docs.append(Document("\n".join(current), doc.metadata))
        # Optionally further chunk if too large
        final_chunks = []
        for d in split_docs:
            if len(d.page_content) > self.chunk_size:
                for i in range(0, len(d.page_content), self.chunk_size - self.chunk_overlap):
                    chunk = d.page_content[i:i+self.chunk_size]
                    final_chunks.append(Document(chunk, d.metadata))
            else:
                final_chunks.append(d)
        return final_chunks

def split_documents(docs: List[Any], chunk_size: int = CHUNK_SIZE, chunk_overlap_pct: int = CHUNK_OVERLAP_PCT, splitter_type: str = "default") -> List[Any]:
    """Split documents with runtime override and splitter type (default or smart_faq)."""
    if splitter_type == "smart_faq":
        splitter = SmartFAQSplitter(chunk_size=chunk_size, chunk_overlap_pct=chunk_overlap_pct)
        return splitter.split(docs)
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

def load_and_split(file_path: str, chunk_size: int = CHUNK_SIZE, chunk_overlap_pct: int = CHUNK_OVERLAP_PCT, splitter_type: str = "default") -> List[Any]:
    docs = load_document(file_path)
    return split_documents(docs, chunk_size, chunk_overlap_pct, splitter_type)
