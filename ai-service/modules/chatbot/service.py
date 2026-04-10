import json
from typing import Generator
from config.gemini import get_model
from utils.errors import raise_error
from modules.chatbot.schemas import ChatMessage, PortalContext
from modules.retrieval.service import retrieve_activities, retrieve_organizations

SYSTEM_PROMPT = """Bạn là trợ lý AI của Student Activity Portal - nền tảng quản lý hoạt động sinh viên.

Nhiệm vụ của bạn:
- Giúp sinh viên tìm kiếm và đăng ký hoạt động phù hợp
- Trả lời câu hỏi về các tổ chức, câu lạc bộ trong trường
- Hỗ trợ thông tin về lịch trình, địa điểm, hình thức đăng ký
- Tư vấn hoạt động dựa trên sở thích của sinh viên

Quy tắc:
- Trả lời bằng tiếng Việt, thân thiện và ngắn gọn
- LUÔN dẫn nguồn từ dữ liệu RAG, không bịa đặt thông tin
- Nếu không có đủ thông tin, nói rõ và gợi ý liên hệ ban tổ chức
"""


def build_system_prompt(context: PortalContext) -> str:
    parts = [SYSTEM_PROMPT]

    # 1. Retrieve relevant context from vector DB (RAG)
    query = context.currentUser.get("query", "") if context.currentUser else ""
    retrieved_activities = retrieve_activities(query, top_k=5) if query else []
    retrieved_orgs = retrieve_organizations(query, top_k=3) if query else []

    # 2. Fallback to backend-provided context if retrieval is empty
    activities_data = (
        retrieved_activities if retrieved_activities else context.activities
    )
    orgs_data = retrieved_orgs if retrieved_orgs else context.organizations

    if activities_data:
        parts.append(f"\nHoạt động liên quan (từ RAG):\n{json.dumps(activities_data, ensure_ascii=False, indent=2)}")

    if orgs_data:
        parts.append(f"\nTổ chức liên quan (từ RAG):\n{json.dumps(orgs_data, ensure_ascii=False, indent=2)}")

    if context.currentUser:
        parts.append(f"\nThông tin sinh viên đang chat:\n{json.dumps(context.currentUser, ensure_ascii=False)}")

    return "\n".join(parts)


def chat(message: str, history: list[ChatMessage], context: PortalContext) -> tuple[str, list[ChatMessage]]:
    model = get_model("gemini-flash-latest")

    system_prompt = build_system_prompt(context)

    # Convert history to Gemini format
    gemini_history = []
    for msg in history:
        gemini_history.append({
            "role": msg.role,
            "parts": [msg.content],
        })

    try:
        chat_session = model.start_chat(
            history=[
                {"role": "user", "parts": [system_prompt]},
                {"role": "model", "parts": ["Tôi đã hiểu. Tôi sẵn sàng hỗ trợ sinh viên!"]},
                *gemini_history,
            ]
        )

        response = chat_session.send_message(message)
        reply = response.text

        updated_history = [
            *history,
            ChatMessage(role="user", content=message),
            ChatMessage(role="model", content=reply),
        ]

        return reply, updated_history

    except Exception as e:
        raise_error("AI_PROCESSING_FAILED", str(e))


def chat_stream(
    message: str,
    history: list[ChatMessage],
    context: PortalContext,
) -> Generator[str, None, None]:
    """Yield text chunks from Gemini using generate_content(stream=True).

    Using generate_content directly is more reliable for streaming than
    ChatSession.send_message(stream=True) in google-generativeai 0.8.x.
    """
    model = get_model("gemini-flash-latest")
    system_prompt = build_system_prompt(context)

    # Build the full conversation as a flat contents list
    contents = [
        {"role": "user", "parts": [system_prompt]},
        {"role": "model", "parts": ["Tôi đã hiểu. Tôi sẵn sàng hỗ trợ sinh viên!"]},
    ]
    for msg in history:
        contents.append({"role": msg.role, "parts": [msg.content]})
    contents.append({"role": "user", "parts": [message]})

    response = model.generate_content(contents, stream=True)

    for chunk in response:
        # chunk.text raises ValueError on safety-blocked or finish-only chunks
        try:
            text = chunk.text
            if text:
                yield text
        except (ValueError, AttributeError):
            continue
