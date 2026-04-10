from typing import Any, List, Literal, Optional
from modules.retrieval.chroma_client import (
    get_or_create_collection,
    reset_all,
    COLLECTION_ACTIVITIES,
    COLLECTION_ORGANIZATIONS,
    COLLECTION_FAQS,
)

# ─── Chunking ──────────────────────────────────────────────────────────────────

def _chunk_activity(activity: dict) -> List[dict]:
    """
    Split an activity dict into chunk documents.
    ChromaDB 1.x auto-embeds via its built-in ONNX model.
    """
    name = activity.get("activityName", "") or ""
    description = activity.get("description", "") or ""
    location = activity.get("location", "") or ""
    org = activity.get("organizationName", "") or ""
    category = activity.get("categoryName", "") or ""
    start_time = _format_time(activity.get("startTime"))
    end_time = _format_time(activity.get("endTime"))
    deadline = _format_time(activity.get("registrationDeadline"))

    content = "\n".join(
        filter(
            None,
            [
                f"Ten hoat dong: {name}",
                f"Mo ta: {description}",
                f"Dia diem: {location}",
                f"To chuc: {org}",
                f"Danh muc: {category}",
                f"Thoi gian bat dau: {start_time}",
                f"Thoi gian ket thuc: {end_time}",
                f"Han dang ky: {deadline}",
            ],
        )
    )
    return [{"content": content, "metadata": {**activity, "_content": content}}]


def _chunk_organization(org: dict) -> List[dict]:
    """Split an organization into chunk documents."""
    name = org.get("organizationName", "") or ""
    description = org.get("description", "") or ""
    org_type = org.get("organizationType", "") or ""

    content = "\n".join(
        filter(
            None,
            [
                f"Ten to chuc: {name}",
                f"Loai: {org_type}",
                f"Mo ta: {description}",
            ],
        )
    )
    return [{"content": content, "metadata": {**org, "_content": content}}]


def _format_time(value: Any) -> str:
    if not value:
        return ""
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)


# ─── Indexing ─────────────────────────────────────────────────────────────────

def index_activities(activities: List[dict]) -> int:
    """Upsert activity chunks. ChromaDB 1.x auto-embeds via built-in model."""
    if not activities:
        return 0
    chunks = []
    for activity in activities:
        chunks.extend(_chunk_activity(activity))

    texts = [c["content"] for c in chunks]
    ids = [f"activity_{activity.get('activityId', i)}_{i}" for i, c in enumerate(chunks)]
    metadatas = [c["metadata"] for c in chunks]

    collection = get_or_create_collection(COLLECTION_ACTIVITIES)
    collection.upsert(ids=ids, documents=texts, metadatas=metadatas)
    return len(chunks)


def index_organizations(orgs: List[dict]) -> int:
    """Upsert organization chunks."""
    if not orgs:
        return 0
    chunks = []
    for org in orgs:
        chunks.extend(_chunk_organization(org))

    texts = [c["content"] for c in chunks]
    ids = [f"org_{org.get('organizationId', i)}_{i}" for i, c in enumerate(chunks)]
    metadatas = [c["metadata"] for c in chunks]

    collection = get_or_create_collection(COLLECTION_ORGANIZATIONS)
    collection.upsert(ids=ids, documents=texts, metadatas=metadatas)
    return len(chunks)


def index_faqs(faqs: List[dict]) -> int:
    """Upsert FAQ chunks."""
    if not faqs:
        return 0
    chunks = []
    for faq in faqs:
        question = faq.get("question", "") or ""
        answer = faq.get("answer", "") or ""
        content = f"Cau hoi: {question}\nTra loi: {answer}"
        chunks.append({"content": content, "metadata": {**faq, "_content": content}})

    texts = [c["content"] for c in chunks]
    ids = [f"faq_{faq.get('faqId', i)}_{i}" for i, faq in enumerate(faqs)]
    metadatas = [c["metadata"] for c in chunks]

    collection = get_or_create_collection(COLLECTION_FAQS)
    collection.upsert(ids=ids, documents=texts, metadatas=metadatas)
    return len(chunks)


def reindex_all(
    activities: List[dict] = None,
    orgs: List[dict] = None,
    faqs: List[dict] = None,
) -> dict:
    """Wipe all collections and re-index from scratch."""
    reset_all()
    return {
        "activities_chunks": index_activities(activities or []),
        "organizations_chunks": index_organizations(orgs or []),
        "faqs_chunks": index_faqs(faqs or []),
    }


# ─── Retrieval ────────────────────────────────────────────────────────────────

def retrieve(
    query: str,
    collection: Literal["activities", "organizations", "faqs"] = "activities",
    top_k: int = 5,
) -> List[dict]:
    """
    Retrieve top-K relevant chunks using text similarity.
    ChromaDB 1.x auto-embeds the query via query_texts.
    Returns list of metadata dicts (includes original fields).
    """
    if not query or not query.strip():
        return []

    coll = get_or_create_collection(collection)
    results = coll.query(
        query_texts=[query],
        n_results=top_k,
        include=["documents", "metadatas"],
    )

    chunks = []
    if results and results.get("documents") and results["metadatas"]:
        for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
            chunks.append({"content": doc, **meta})

    return chunks


def retrieve_activities(query: str, top_k: int = 5) -> List[dict]:
    return retrieve(query, COLLECTION_ACTIVITIES, top_k)


def retrieve_organizations(query: str, top_k: int = 3) -> List[dict]:
    return retrieve(query, COLLECTION_ORGANIZATIONS, top_k)


def retrieve_faqs(query: str, top_k: int = 3) -> List[dict]:
    return retrieve(query, COLLECTION_FAQS, top_k)
