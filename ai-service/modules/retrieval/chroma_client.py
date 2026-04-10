import os
from typing import Optional
import chromadb

# Persistent storage path (./data/chroma)
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "chroma")

_client: Optional[chromadb.api.ClientAPI] = None

COLLECTION_ACTIVITIES = "activities"
COLLECTION_ORGANIZATIONS = "organizations"
COLLECTION_FAQS = "faqs"


def get_client() -> chromadb.api.ClientAPI:
    """Lazily initialise a Persistent ChromaDB client."""
    global _client
    if _client is None:
        os.makedirs(DATA_DIR, exist_ok=True)
        _client = chromadb.PersistentClient(path=DATA_DIR)
    return _client


def get_or_create_collection(name: str):
    """Return a collection, creating it if it doesn't exist."""
    client = get_client()
    return client.get_or_create_collection(
        name=name,
        metadata={"description": f"Knowledge base: {name}"},
    )


def delete_collection(name: str):
    """Delete a collection by name."""
    client = get_client()
    try:
        client.delete_collection(name)
    except Exception:
        pass  # collection may not exist


def reset_all():
    """Delete all collections — used for full re-index."""
    for name in [COLLECTION_ACTIVITIES, COLLECTION_ORGANIZATIONS, COLLECTION_FAQS]:
        delete_collection(name)
