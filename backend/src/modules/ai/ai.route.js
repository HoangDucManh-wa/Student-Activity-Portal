const { Router } = require("express");
const controller = require("./ai.controller");
const validate = require("../../middlewares/validate.middleware");
const { protect } = require("../../middlewares/auth.middleware");
const { searchSchema, recommendSchema, askSchema } = require("./ai.validation");

const router = Router();

router.use(protect);

router.post("/search", validate(searchSchema), controller.search);
router.post("/recommend", validate(recommendSchema), controller.recommend);
router.post("/ask", validate(askSchema), controller.ask);

module.exports = router;
