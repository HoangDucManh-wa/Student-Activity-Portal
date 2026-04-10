"""
Embedder module for ChromaDB 1.x.

ChromaDB 1.x ships with a built-in all-MiniLM-L6-v2 ONNX embedding model
that runs locally — no API key or external call needed.
Documents are embedded automatically when passed via the `documents` kwarg
to collection.upsert(), and queries are embedded automatically via query_texts.
"""

from typing import List


def embed_documents(texts: List[str]) -> List[List[float]]:
    """
    Embed a list of texts using ChromaDB's built-in ONNX embedding model.

    ChromaDB 1.x handles this automatically when you pass `documents=[]`
    to upsert(). This function is kept for explicit control when you need
    the raw embedding vectors (e.g. for query).
    """
    from chromadb import Documents, Embeddings, EmbeddingFunction

    class DummyEmbeddingFunction(EmbeddingFunction):
        def __call__(self, texts: Documents) -> Embeddings:
            # Import here to avoid circular deps
            from chromadb.utils.embedding_functions import ONNXMiniLM_L6_v2
            ef = ONNXMiniLM_L6_v2()
            return ef(texts)

    ef = DummyEmbeddingFunction()
    return ef(texts)
