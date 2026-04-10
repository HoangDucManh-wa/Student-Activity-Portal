from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from middlewares.service_auth import verify_service_key
from modules.retrieval import service as retrieval_service

router = APIRouter(dependencies=[Depends(verify_service_key)])


class IndexActivitiesRequest(BaseModel):
    activities: list[dict]


class IndexOrganizationsRequest(BaseModel):
    organizations: list[dict]


class IndexFaqsRequest(BaseModel):
    faqs: list[dict]


class ReindexAllRequest(BaseModel):
    activities: list[dict] = []
    organizations: list[dict] = []
    faqs: list[dict] = []


@router.post("/index-activities")
def index_activities(body: IndexActivitiesRequest):
    count = retrieval_service.index_activities(body.activities)
    return {"success": True, "data": {"chunks_indexed": count}}


@router.post("/index-organizations")
def index_organizations(body: IndexOrganizationsRequest):
    count = retrieval_service.index_organizations(body.organizations)
    return {"success": True, "data": {"chunks_indexed": count}}


@router.post("/index-faqs")
def index_faqs(body: IndexFaqsRequest):
    count = retrieval_service.index_faqs(body.faqs)
    return {"success": True, "data": {"chunks_indexed": count}}


@router.post("/reindex-all")
def reindex_all(body: ReindexAllRequest):
    stats = retrieval_service.reindex_all(
        activities=body.activities,
        orgs=body.organizations,
        faqs=body.faqs,
    )
    return {"success": True, "data": stats}


@router.get("/health")
def health():
    return {"success": True, "message": "RAG module OK"}
