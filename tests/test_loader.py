import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

import logging
from backend.core.loader import load_and_split

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger("test_loader")

def test_load_and_split_txt():
    logger.info("Running test_load_and_split_txt...")
    try:
        test_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "sample.txt"))
        docs = load_and_split(test_file)
        assert len(docs) > 0
        assert hasattr(docs[0], "page_content")
        logger.info("test_load_and_split_txt passed.")
    except Exception as e:
        logger.error(f"test_load_and_split_txt failed: {e}")
        raise

def test_load_and_split_md():
    logger.info("Running test_load_and_split_md...")
    try:
        test_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "sample.md"))
        docs = load_and_split(test_file)
        assert len(docs) > 0
        assert hasattr(docs[0], "page_content")
        logger.info("test_load_and_split_md passed.")
    except Exception as e:
        logger.error(f"test_load_and_split_md failed: {e}")
        raise
