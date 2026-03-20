import json
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from middlewares.service_auth import verify_service_key
from modules.chatbot.schemas import ChatRequest, ChatResponse
from modules.chatbot import service

router = APIRouter(dependencies=[Depends(verify_service_key)])


@router.post("", response_model=dict)
def chat(body: ChatRequest):
    reply, updated_history = service.chat(body.message, body.history, body.context)
    return {
        "success": True,
        "data": {
            "reply": reply,
            "history": [msg.model_dump() for msg in updated_history],
        },
    }


@router.post("/stream")
def chat_stream(body: ChatRequest):
    """Server-Sent Events endpoint — streams Gemini tokens as they arrive."""

    def generate():
        try:
            for text_chunk in service.chat_stream(body.message, body.history, body.context):
                payload = json.dumps({"text": text_chunk}, ensure_ascii=False)
                yield f"data: {payload}\n\n"
        except Exception:
            err_msg = "Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu. Vui lòng thử lại."
            yield f"data: {json.dumps({'text': err_msg}, ensure_ascii=False)}\n\n"
        finally:
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
