"""
Loader utilities for reading, splitting, and chunking documents for RAG pipelines.
Supports CSV, TXT, PDF, DOCX, MD, HTML, PPTX, IPYNB, and more.
"""

import os
from pathlib import Path
import pandas as pd
from typing import List, Any
from tqdm import tqdm
from config.constants import CHUNK_SIZE, CHUNK_OVERLAP_PCT
import logging

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    from langchain_community.document_loaders import (
        CSVLoader,
        TextLoader,
        PyPDFium2Loader,
        UnstructuredWordDocumentLoader,
        UnstructuredMarkdownLoader,
        UnstructuredHTMLLoader,
        UnstructuredPowerPointLoader,
        NotebookLoader,
    )
    from langchain_community.text_splitter import RecursiveCharacterTextSplitter
    from langchain_core.documents import Document
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
    """
    Load a document from disk and return a list of Document objects.

    Args:
        file_path (str): Path to the file to load.
        mapping (dict): Mapping of file extensions to loader classes/args.

    Returns:
        List[Any]: List of Document objects (one per row for CSV).
    """
    logger.info(f"[loader] load_document called for file_path: {file_path}")
    ext = "." + file_path.rsplit(".", 1)[-1].lower()
    # Always use pandas for CSV to ensure JSON output per row
    if ext == ".csv":
        import json

        df = pd.read_csv(file_path)
        logger.info(f"[loader] Loaded CSV with shape: {df.shape}")
        # Detect if Document supports metadata as a keyword argument
        import inspect

        doc_params = inspect.signature(Document).parameters
        if "metadata" in doc_params:
            logger.info("[loader] Using langchain Document with metadata kwarg.")
            return [
                Document(row.to_json(), metadata={"row": i}) for i, row in df.iterrows()
            ]
        else:
            logger.info("[loader] Using fallback Document with metadata positional.")
            return [Document(row.to_json(), {"row": i}) for i, row in df.iterrows()]
    if ext in mapping:
        loader_class, loader_args = mapping[ext]
        try:
            loader = loader_class(file_path, **loader_args)
            logger.info(f"[loader] Using loader: {loader_class.__name__}")
            return loader.load()
        except Exception as e:
            logger.error(
                f"[Loader] {ext} loader failed: Error loading {file_path}. Trying pandas fallback."
            )
    # Fallback for .md: read as plain text if loader fails
    if ext == ".md":
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            logger.info(f"[loader] Markdown fallback succeeded for {file_path}.")
            return [Document(content, metadata={"source": file_path})]
        except Exception as e:
            logger.error(f"[loader] Markdown fallback failed: {e}")
            return []
    # Fallback: try pandas for TXT
    if ext == ".txt":
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            return [Document(content, metadata={"source": file_path})]
        except Exception as e:
            logger.error(f"[loader] TXT fallback failed: {e}")
            return []
    logger.warning(
        f"[loader] No loader found for extension: {ext}. Returning empty list."
    )
    return []


def load_directory(path: str, silent_errors: bool = True) -> List[Any]:
    """
    Load all documents from a directory recursively.

    Args:
        path (str): Directory path to search for files.
        silent_errors (bool): If True, skip files that fail to load.

    Returns:
        List[Any]: List of loaded Document objects.
    """
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
    """
    Splits FAQ-style documents into Q&A pairs or logical chunks.
    """

    def __init__(
        self,
        question_prefixes=None,
        chunk_size=CHUNK_SIZE,
        chunk_overlap_pct=CHUNK_OVERLAP_PCT,
    ):
        """
        Initialize SmartFAQSplitter.

        Args:
            question_prefixes (list): List of prefixes to identify questions.
            chunk_size (int): Max chunk size.
            chunk_overlap_pct (int): Overlap percentage between chunks.
        """
        self.question_prefixes = question_prefixes or [
            "Q:",
            "Question:",
            "Q.",
            "Q -",
            "Q-",
        ]
        self.chunk_size = chunk_size
        self.chunk_overlap = int(chunk_size * chunk_overlap_pct / 100)

    def split(self, docs: List[Any]) -> List[Any]:
        """
        Split documents into Q&A or logical chunks, with optional further chunking.

        Args:
            docs (List[Any]): List of Document objects.

        Returns:
            List[Any]: List of split Document objects.
        """
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
                for i in range(
                    0, len(d.page_content), self.chunk_size - self.chunk_overlap
                ):
                    chunk = d.page_content[i : i + self.chunk_size]
                    final_chunks.append(Document(chunk, d.metadata))
            else:
                final_chunks.append(d)
        return final_chunks


def split_documents(
    docs: List[Any],
    chunk_size: int = CHUNK_SIZE,
    chunk_overlap_pct: int = CHUNK_OVERLAP_PCT,
    splitter_type: str = "default",
) -> List[Any]:
    """
    Split documents with runtime override and splitter type (default or smart_faq).

    Args:
        docs (List[Any]): List of Document objects.
        chunk_size (int): Max chunk size.
        chunk_overlap_pct (int): Overlap percentage between chunks.
        splitter_type (str): Type of splitter to use ("default" or "smart_faq").

    Returns:
        List[Any]: List of split Document objects.
    """
    if splitter_type == "smart_faq":
        splitter = SmartFAQSplitter(
            chunk_size=chunk_size, chunk_overlap_pct=chunk_overlap_pct
        )
        return splitter.split(docs)
    # Use RecursiveCharacterTextSplitter if available, else fallback to simple split
    try:
        chunk_overlap = int(chunk_size * chunk_overlap_pct / 100)
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ".", "!", "?", ",", " ", ""],
        )
        return splitter.split_documents(docs)
    except Exception:
        # Fallback: no split
        return docs


def load_and_split(
    file_path: str,
    chunk_size: int = CHUNK_SIZE,
    chunk_overlap_pct: int = CHUNK_OVERLAP_PCT,
    splitter_type: str = "default",
) -> List[Any]:
    """
    Load a file and split it into chunks for RAG ingestion.

    Args:
        file_path (str): Path to the file to load.
        chunk_size (int): Max chunk size.
        chunk_overlap_pct (int): Overlap percentage between chunks.
        splitter_type (str): Type of splitter to use ("default" or "smart_faq").

    Returns:
        List[Any]: List of split Document objects.
    """
    docs = load_document(file_path)
    return split_documents(docs, chunk_size, chunk_overlap_pct, splitter_type)
