import logging
from backend.core.chain import create_qa_chain, create_multi_chain

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger("test_chain")

def test_create_qa_chain():
    logger.info("Running test_create_qa_chain...")
    try:
        class DummyLLM:
            def __call__(self, *args, **kwargs):
                return "test"
        chain = create_qa_chain(DummyLLM())
        assert chain is not None
        logger.info("test_create_qa_chain passed.")
    except Exception as e:
        logger.error(f"test_create_qa_chain failed: {e}")
        raise

def test_create_multi_chain():
    logger.info("Running test_create_multi_chain...")
    try:
        class DummyLLM:
            def __call__(self, *args, **kwargs):
                return "test"
        class DummyRetriever:
            def get_relevant_documents(self, question):
                return []
        chain = create_multi_chain(DummyLLM(), [DummyRetriever()])
        assert chain is not None
        logger.info("test_create_multi_chain passed.")
    except Exception as e:
        logger.error(f"test_create_multi_chain failed: {e}")
        raise
