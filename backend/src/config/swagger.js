const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Student Activity Portal API",
      version: "1.0.0",
      description:
        "REST API documentation for the Student Activity Portal. Manages clubs, events, registrations, notifications, and AI features.",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT access token obtained from /api/auth/login",
        },
      },
      schemas: {
        ApiSuccess: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { description: "Response payload" },
          },
        },
        ApiError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string", example: "Error message" },
          },
        },
        UserProfile: {
          type: "object",
          properties: {
            MaNguoiDung: { type: "string", description: "User ID" },
            TenNguoiDung: { type: "string", description: "Full name" },
            Email: { type: "string", format: "email", description: "Email address" },
            MaSV: { type: "string", description: "Student ID", nullable: true },
            SDT: { type: "string", description: "Phone number", nullable: true },
            LoaiTaiKhoan: {
              type: "string",
              enum: ["ADMIN", "CHU_CLB", "SINH_VIEN"],
              description: "Account type / role",
            },
            TrangThai: {
              type: "string",
              enum: ["HOAT_DONG", "KHOA", "CHO_DUYET"],
              description: "Account status",
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        AuthTokens: {
          type: "object",
          properties: {
            accessToken: { type: "string", description: "JWT access token" },
            refreshToken: { type: "string", description: "JWT refresh token" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "object",
              properties: {
                accessToken: { type: "string" },
                refreshToken: { type: "string" },
                user: { $ref: "#/components/schemas/UserProfile" },
              },
            },
          },
        },
        Notification: {
          type: "object",
          properties: {
            MaThongBao: { type: "string", description: "Notification ID" },
            TieuDe: { type: "string", description: "Title" },
            NoiDung: { type: "string", description: "Content" },
            LoaiThongBao: {
              type: "string",
              enum: ["HE_THONG", "HOAT_DONG", "CLB", "TUYEN_DUNG"],
              description: "Notification type",
            },
            TrangThai: {
              type: "string",
              enum: ["CHUA_DOC", "DA_DOC"],
              description: "Read status",
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        NotificationStats: {
          type: "object",
          properties: {
            total: { type: "integer", description: "Total notifications" },
            unread: { type: "integer", description: "Unread count" },
            read: { type: "integer", description: "Read count" },
          },
        },
        OverviewStats: {
          type: "object",
          properties: {
            totalUsers: { type: "integer" },
            totalClubs: { type: "integer" },
            totalEvents: { type: "integer" },
            totalRegistrations: { type: "integer" },
          },
        },
        ActivityStats: {
          type: "object",
          properties: {
            month: { type: "string" },
            events: { type: "integer" },
            registrations: { type: "integer" },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: "Authentication required or token invalid/expired",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
              example: { success: false, error: "Token không hợp lệ" },
            },
          },
        },
        Forbidden: {
          description: "Insufficient permissions for this action",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
              example: {
                success: false,
                error: "Bạn không có quyền thực hiện thao tác này",
              },
            },
          },
        },
        ValidationError: {
          description: "Request body failed validation",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
              example: { success: false, error: "Dữ liệu không hợp lệ" },
            },
          },
        },
        NotFound: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
              example: {
                success: false,
                error: "Không tìm thấy tài nguyên",
              },
            },
          },
        },
      },
    },
    tags: [
      { name: "Health", description: "Server health check" },
      { name: "Auth", description: "User authentication and account management" },
      { name: "Notifications", description: "In-app, email, and SMS notifications" },
      { name: "Admin", description: "Admin-only statistics and management" },
      { name: "AI", description: "AI-powered search and recommendations (Gemini)" },
    ],
  },
  apis: ["./src/modules/**/*.route.js"],
};

module.exports = swaggerJsdoc(options);
