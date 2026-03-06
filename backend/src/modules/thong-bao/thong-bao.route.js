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

// All routes require authentication
router.use(protect);

// Send notifications (ADMIN, CHU_CLB only)
router.post(
  "/send",
  authorize("ADMIN", "CHU_CLB"),
  validate(sendNotificationSchema),
  controller.sendNotification
);
router.post(
  "/send-bulk",
  authorize("ADMIN", "CHU_CLB"),
  validate(sendBulkNotificationSchema),
  controller.sendBulkNotification
);

// Read notifications (any authenticated user)
// NOTE: specific paths before /:id to avoid conflicts
router.get("/stats", controller.getStats);
router.put("/read-all", controller.markAllAsRead);
router.get("/", controller.getMyNotifications);
router.get("/:id", controller.getNotificationById);
router.put("/:id/read", controller.markAsRead);
router.delete("/:id", controller.deleteNotification);

module.exports = router;
