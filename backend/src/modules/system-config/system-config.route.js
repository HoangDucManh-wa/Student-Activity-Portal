const { Router } = require("express");
const controller = require("./system-config.controller");
const validate = require("../../middlewares/validate.middleware");
const { validateParams } = require("../../middlewares/validate.middleware");
const { protect } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/role.middleware");
const { updateConfigSchema, configKeyParam, orgIdParam, categoryParam } = require("./system-config.validation");

const router = Router();

router.use(protect);
router.use(authorize("admin"));

// Get all global configs
router.get("/", controller.getAllConfigs);

// Get configs by category
router.get("/category/:category", validateParams(categoryParam), controller.getConfigsByCategory);

// Get org overrides (must be before /:key to avoid conflict)
router.get("/org/:organizationId", validateParams(orgIdParam), controller.getOrgOverrides);

// Get all overrides for a specific config key
router.get("/:key/overrides", validateParams(configKeyParam), controller.getOverridesByKey);

// Get single config by key
router.get("/:key", validateParams(configKeyParam), controller.getConfigByKey);

// Update config (global or org override)
router.put("/:key", validateParams(configKeyParam), validate(updateConfigSchema), controller.updateConfig);

// Delete org override
router.delete(
  "/:key/org/:organizationId",
  validateParams(configKeyParam.merge(orgIdParam)),
  controller.deleteOrgOverride,
);

module.exports = router;
