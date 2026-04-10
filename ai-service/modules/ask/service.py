import json
from config.gemini import get_model
from utils.errors import raise_error
from modules.ask.schemas import AskContext
from modules.retrieval.service import retrieve_activities, retrieve_organizations


def ask_about_activities(question: str, context: AskContext) -> str:
    model = get_model()

    # 1. Retrieve relevant chunks from vector DB (RAG)
    retrieved_activities = retrieve_activities(question, top_k=5)
    retrieved_orgs = retrieve_organizations(question, top_k=3)

    # 2. Merge retrieved chunks with backend metadata
    rag_activities = (
        retrieved_activities
        if retrieved_activities
        else [a.model_dump() for a in context.activities]
    )
    rag_orgs = (
        retrieved_orgs if retrieved_orgs else [o.model_dump() for o in context.organizations]
    )

    prompt = f"""Bạn là trợ lý AI của Student Activity Portal - nền tảng quản lý hoạt động sinh viên.

Nhiệm vụ: Trả lời câu hỏi dựa trên dữ liệu được truy xuất từ cơ sở tri thức (RAG). LUÔN dẫn nguồn từ dữ liệu gốc, không bịa đặt.

Dữ liệu hoạt động liên quan:
{json.dumps(rag_activities, ensure_ascii=False, indent=2)}

Dữ liệu tổ chức liên quan:
{json.dumps(rag_orgs, ensure_ascii=False, indent=2)}

Câu hỏi của sinh viên: "{question}"

Quy tắc trả lời:
- Trả lời bằng tiếng Việt, thân thiện và chính xác
- LUÔN tham chiếu đúng tên hoạt động, ngày giờ, địa điểm từ dữ liệu RAG phía trên
- Nếu không có đủ thông tin, nói rõ và gợi ý liên hệ ban tổ chức
- Không bịa đặt thông tin"""
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        raise_error("AI_PROCESSING_FAILED", str(e))
