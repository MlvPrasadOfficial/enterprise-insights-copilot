# Enterprise Insights Copilot – Advanced Usage & Architecture

## Advanced Features
- Modular loader abstraction (CSV, TXT, PDF, DOCX, MD, HTML, PPTX, IPYNB, etc.)
- SmartFAQSplitter for FAQ-style docs
- Runtime override of chunk size, overlap, model, embedding, and splitter type
- MultiRetrieverFAQChain for multi-retriever (knowledge base + FAQ) and streaming responses
- Async job orchestration for ingestion and upsert
- Retry logic with exponential backoff for OpenAI/Pinecone API calls
- Usage/cost tracking per user/session
- Per-user/session chat history and vector store management
- Test suite for loader and chain orchestration

## Config Options
- See `config/constants.py` for all overridable parameters
- Runtime overrides supported via API/frontend (see loader and chain docs)

## Architecture Diagram
```
[User/Frontend]
      |
  [FastAPI Backend] <--- [Streamlit Frontend]
      |
  [Loader/Chain/Job/Session Modules]
      |
  [Pinecone Vector DB] + [OpenAI LLM]
```

## Extending
- Add new file types: update `backend/core/loader.py` FILE_LOADER_MAPPING
- Add new chains: extend `backend/core/chain.py`
- Add new jobs: extend `backend/core/jobs.py`

## Testing
- See `tests/` for examples

## Deployment
- Windows and cloud (Render) ready
- See Dockerfile and requirements.txt

---
For more, see the main README and code comments.
