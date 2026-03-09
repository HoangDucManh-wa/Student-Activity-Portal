const { Router } = require("express");
const controller = require("./hoat-dong.controller");
const validate = require("../../middlewares/validate.middleware");
const { protect } = require("../../middlewares/auth.middleware");
const { createHoatDongSchema } = require("./hoat-dong.validation");

const router = Router();

router.get("/", controller.getHoatDongs);
router.post("/", protect, validate(createHoatDongSchema), controller.createHoatDong);

module.exports = router;