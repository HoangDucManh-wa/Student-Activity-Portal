module.exports = {
  // ─── Auth ──────────────────────────────────────────────
  AUTH_EMAIL_EXISTS:      { statusCode: 409, message: "Email đã được sử dụng" },
  AUTH_INVALID_CREDS:     { statusCode: 401, message: "Email hoặc mật khẩu không đúng" },
  AUTH_ACCOUNT_LOCKED:    { statusCode: 403, message: "Tài khoản đã bị khóa" },
  AUTH_ACCOUNT_PENDING:   { statusCode: 403, message: "Tài khoản đang chờ phê duyệt" },
  AUTH_WRONG_PASSWORD:    { statusCode: 400, message: "Mật khẩu cũ không đúng" },
  AUTH_TOKEN_MISSING:     { statusCode: 401, message: "Không có token xác thực" },
  AUTH_TOKEN_BLACKLISTED: { statusCode: 401, message: "Token đã bị đăng xuất" },
  AUTH_TOKEN_EXPIRED:     { statusCode: 401, message: "Token đã hết hạn" },
  AUTH_TOKEN_INVALID:     { statusCode: 401, message: "Token không hợp lệ" },
  AUTH_REFRESH_INVALID:   { statusCode: 401, message: "Refresh token không hợp lệ" },
  AUTH_RESET_INVALID:     { statusCode: 400, message: "Link khôi phục không hợp lệ hoặc đã hết hạn" },

  // ─── User ──────────────────────────────────────────────
  USER_NOT_FOUND:         { statusCode: 404, message: "Người dùng không tồn tại" },

  // ─── Notification ─────────────────────────────────────
  NOTIFICATION_NOT_FOUND:      { statusCode: 404, message: "Thông báo không tồn tại" },
  NOTIFICATION_SEND_FAILED:    { statusCode: 500, message: "Gửi thông báo thất bại" },
  NOTIFICATION_NO_RECIPIENTS:  { statusCode: 400, message: "Không có người nhận nào" },

  // ─── AI ───────────────────────────────────────────────
  AI_SERVICE_UNAVAILABLE:      { statusCode: 503, message: "Dịch vụ AI tạm thời không khả dụng" },

  // ─── Common ────────────────────────────────────────────
  FORBIDDEN:              { statusCode: 403, message: "Bạn không có quyền thực hiện thao tác này" },
  VALIDATION_ERROR:       { statusCode: 400, message: "Dữ liệu không hợp lệ" },
  NOT_FOUND:              { statusCode: 404, message: "Không tìm thấy tài nguyên" },
  INTERNAL_ERROR:         { statusCode: 500, message: "Lỗi hệ thống" },
};
