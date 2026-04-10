import os
from fastapi import Header, HTTPException, Request

ALLOWED_LOCALhostS = {"127.0.0.1", "localhost", "::1"}


async def verify_service_key(
    request: Request,
    x_service_key: str = Header(...),
):
    # Skip auth for localhost/internal calls (backend → AI service on same machine)
    client_host = (
        request.client.host
        if request.client
        else None
    )
    if client_host in ALLOWED_LOCALhostS:
        return

    expected = os.getenv("AI_SERVICE_SECRET")
    if not x_service_key or x_service_key != expected:
        raise HTTPException(
            status_code=401,
            detail={"code": "UNAUTHORIZED_SERVICE", "message": "Invalid or missing service key"},
        )
