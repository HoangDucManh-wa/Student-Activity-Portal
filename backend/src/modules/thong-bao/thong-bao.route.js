const { Router } = require("express");
const controller = require("./thong-bao.controller");
const validate = require("../../middlewares/validate.middleware");
const { protect } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/role.middleware");
const {
  sendNotificationSchema,
  sendBulkNotificationSchema,
} = require("./thong-bao.validation");

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: In-app, email, and SMS notification management
 */

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/thong-bao/send:
 *   post:
 *     summary: Send a notification to a single user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     description: Requires ADMIN or CHU_CLB role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [TieuDe, NoiDung, MaNguoiDung]
 *             properties:
 *               TieuDe:
 *                 type: string
 *                 maxLength: 255
 *                 description: Notification title
 *                 example: Event registration confirmed
 *               NoiDung:
 *                 type: string
 *                 description: Notification body content
 *                 example: Your registration for "Tech Club Spring 2025" has been confirmed.
 *               MaNguoiDung:
 *                 type: string
 *                 description: Target user ID
 *                 example: usr_abc123
 *               LoaiThongBao:
 *                 type: string
 *                 enum: [HE_THONG, HOAT_DONG, CLB, TUYEN_DUNG]
 *                 default: HE_THONG
 *                 description: Notification type
 *               KenhGui:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [IN_APP, EMAIL, SMS]
 *                 default: [IN_APP]
 *                 description: Delivery channels
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post(
  "/send",
  authorize("ADMIN", "CHU_CLB"),
  validate(sendNotificationSchema),
  controller.sendNotification
);

/**
 * @swagger
 * /api/thong-bao/send-bulk:
 *   post:
 *     summary: Send a notification to multiple users at once
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     description: Requires ADMIN or CHU_CLB role. Target by user list, club, or all users.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [TieuDe, NoiDung]
 *             properties:
 *               TieuDe:
 *                 type: string
 *                 maxLength: 255
 *                 description: Notification title
 *                 example: Upcoming club event reminder
 *               NoiDung:
 *                 type: string
 *                 description: Notification body
 *                 example: Don't forget the coding workshop this Saturday at 9am!
 *               LoaiThongBao:
 *                 type: string
 *                 enum: [HE_THONG, HOAT_DONG, CLB, TUYEN_DUNG]
 *                 default: HE_THONG
 *               KenhGui:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [IN_APP, EMAIL, SMS]
 *                 default: [IN_APP]
 *               DanhSachNguoiDung:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Specific list of user IDs (optional)
 *               MaToChuc:
 *                 type: string
 *                 description: Club ID — send to all members of this club (optional)
 *               TatCa:
 *                 type: boolean
 *                 description: If true, send to all users in the system
 *               ThoiGianGui:
 *                 type: string
 *                 format: date-time
 *                 description: Scheduled send time (optional, ISO 8601)
 *     responses:
 *       200:
 *         description: Bulk notifications queued successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post(
  "/send-bulk",
  authorize("ADMIN", "CHU_CLB"),
  validate(sendBulkNotificationSchema),
  controller.sendBulkNotification
);

/**
 * @swagger
 * /api/thong-bao/stats:
 *   get:
 *     summary: Get notification statistics for the current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification counts by status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/NotificationStats'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/stats", controller.getStats);

/**
 * @swagger
 * /api/thong-bao/read-all:
 *   put:
 *     summary: Mark all notifications as read for the current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put("/read-all", controller.markAllAsRead);

/**
 * @swagger
 * /api/thong-bao:
 *   get:
 *     summary: List notifications for the current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: LoaiThongBao
 *         schema:
 *           type: string
 *           enum: [HE_THONG, HOAT_DONG, CLB, TUYEN_DUNG]
 *         description: Filter by notification type
 *       - in: query
 *         name: TrangThai
 *         schema:
 *           type: string
 *           enum: [CHUA_DOC, DA_DOC]
 *         description: Filter by read status
 *     responses:
 *       200:
 *         description: Paginated list of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/", controller.getMyNotifications);

/**
 * @swagger
 * /api/thong-bao/{id}:
 *   get:
 *     summary: Get a single notification by ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/:id", controller.getNotificationById);

/**
 * @swagger
 * /api/thong-bao/{id}/read:
 *   put:
 *     summary: Mark a specific notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put("/:id/read", controller.markAsRead);

/**
 * @swagger
 * /api/thong-bao/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete("/:id", controller.deleteNotification);

module.exports = router;
