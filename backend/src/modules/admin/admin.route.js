const { Router } = require("express");
const controller = require("./admin.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/role.middleware");

const router = Router();

router.use(protect);
router.use(authorize("ADMIN"));

router.get("/stats/overview", controller.getOverviewStats);
router.get("/stats/activities", controller.getActivityStats);

module.exports = router;
