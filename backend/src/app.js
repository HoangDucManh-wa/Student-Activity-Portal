const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const errorMiddleware = require("./middlewares/error.middleware");
const authRoutes = require("./modules/auth/auth.route");
const thongBaoRoutes = require("./modules/thong-bao/thong-bao.route");
const adminRoutes = require("./modules/admin/admin.route");
const aiRoutes = require("./modules/ai/ai.route");

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, error: "Quá nhiều yêu cầu, thử lại sau" },
  })
);

// ─── Body parser ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging (dev only) ───────────────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(require("morgan")("dev"));
}

// ─── Swagger UI (dev only) ────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
  app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));
}

// ─── Health check ─────────────────────────────────────────────────────────────
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Server health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get("/health", (req, res) => {
  res.json({ success: true, message: "OK", timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);

app.use("/api/thong-bao", thongBaoRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);

// TODO: add more module routes here
// app.use("/api/nguoi-dung", nguoiDungRoutes);
// app.use("/api/to-chuc", toChucRoutes);
// app.use("/api/hoat-dong", hoatDongRoutes);
// app.use("/api/phieu-dang-ky", phieuDangKyRoutes);
// app.use("/api/dot-tuyen-clb", dotTuyenClbRoutes);

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} không tồn tại`,
  });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;
