from backend.core.chain import create_qa_chain, create_multi_chain

def test_create_qa_chain():
    class DummyLLM:
        def __call__(self, *args, **kwargs):
            return "test"
    chain = create_qa_chain(DummyLLM())
    assert chain is not None

def test_create_multi_chain():
    class DummyLLM:
        def __call__(self, *args, **kwargs):
            return "test"
    class DummyRetriever:
        def get_relevant_documents(self, question):
            return []
    chain = create_multi_chain(DummyLLM(), [DummyRetriever()])
    assert chain is not None
