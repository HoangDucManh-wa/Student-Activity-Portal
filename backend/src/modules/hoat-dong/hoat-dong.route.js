const { Router } = require("express");
const controller = require("./hoat-dong.controller");
const validate = require("../../middlewares/validate.middleware");
const { protect, restrictTo } = require("../../middlewares/auth.middleware");
const { createHoatDongSchema } = require("./hoat-dong.validation");

const router = Router();

router.get("/", controller.getHoatDongs);
router.get("/:id", controller.getHoatDongById);
router.post("/", protect, validate(createHoatDongSchema), controller.createHoatDong);
router.patch("/:id", protect, controller.updateHoatDong);
router.patch("/:id/approve", protect, restrictTo("ADMIN"), controller.pheDuyetHoatDong);

module.exports = router;