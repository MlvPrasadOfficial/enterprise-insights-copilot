from backend.core.loader import load_and_split

def test_load_and_split_txt():
    docs = load_and_split("../data/sample.txt")
    assert len(docs) > 0
    assert hasattr(docs[0], "page_content")

def test_load_and_split_md():
    docs = load_and_split("../data/sample.md")
    assert len(docs) > 0
    assert hasattr(docs[0], "page_content")
