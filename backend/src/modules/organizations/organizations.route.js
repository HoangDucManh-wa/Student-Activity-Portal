const { Router } = require("express");
const controller = require("./organizations.controller");
const validate = require("../../middlewares/validate.middleware");
const { validateQuery } = require("../../middlewares/validate.middleware");
const { protect } = require("../../middlewares/auth.middleware");
const { authorize, authorizeOrgType } = require("../../middlewares/role.middleware");
const {
  createOrganizationSchema,
  updateOrganizationSchema,
  getOrganizationsQuerySchema,
  addMemberSchema,
  updateMemberRoleSchema,
  createGroupSchema,
  pushToGroupSchema,
} = require("./organizations.validation");

const router = Router();

// ─── Public (không cần đăng nhập) ───────────────────────────────────────────
router.get("/", validateQuery(getOrganizationsQuerySchema), controller.getOrganizations);

// ─── Cần đăng nhập ──────────────────────────────────────────────────────────
router.get("/my", protect, authorize("organization_leader", "admin"), controller.getMyOrganization);

// ─── Parameterized routes (must come after specific named routes) ────────────
router.get("/:id/stats", controller.getOrgStats);
router.get("/:id/members", controller.getMembers);
router.get("/:id", controller.getOrganizationById);

// ─── Admin / Organization Leader ────────────────────────────────────────────
router.post(
  "/",
  protect,
  authorize("admin", "organization_leader"),
  validate(createOrganizationSchema),
  controller.createOrganization
);

router.put(
  "/:id",
  protect,
  authorize("admin", "organization_leader"),
  validate(updateOrganizationSchema),
  controller.updateOrganization
);

router.delete("/:id", protect, authorize("admin"), controller.deleteOrganization);

// ─── Recruitment (club + organization) ────────────────────────────────────────────
router.patch(
  "/:id/recruiting",
  protect,
  authorize("organization_leader"),
  controller.toggleRecruiting
);

router.patch(
  "/:id/recruitment/open",
  protect,
  authorize("organization_leader"),
  controller.openRecruitment
);

router.patch(
  "/:id/recruitment/close",
  protect,
  authorize("organization_leader"),
  controller.closeRecruitment
);

router.put(
  "/:id/recruitment",
  protect,
  authorize("organization_leader"),
  controller.updateRecruitmentSettings
);

// ─── Club-only: members ──────────────────────────────────────────────────────
router.post(
  "/:id/members",
  protect,
  authorize("organization_leader"),
  authorizeOrgType("club"),
  validate(addMemberSchema),
  controller.addMember
);

router.put(
  "/:id/members/:userId",
  protect,
  authorize("organization_leader"),
  authorizeOrgType("club"),
  validate(updateMemberRoleSchema),
  controller.updateMemberRole
);

router.delete(
  "/:id/members/:userId",
  protect,
  authorize("organization_leader"),
  authorizeOrgType("club"),
  controller.removeMember
);

router.post(
  "/:id/notify-candidates",
  protect,
  authorize("organization_leader"),
  authorizeOrgType("club"),
  controller.notifyCandidates
);

// ─── Group management (club + organization) ────────────────────────────────
router.get(
  "/:id/members/all",
  protect,
  authorize("organization_leader"),
  controller.getAllMembersWithGroups
);

router.get(
  "/:id/groups",
  protect,
  authorize("organization_leader"),
  controller.getGroups
);

router.post(
  "/:id/groups",
  protect,
  authorize("organization_leader"),
  validate(createGroupSchema),
  controller.createGroup
);

router.post(
  "/:id/push-to-group",
  protect,
  authorize("organization_leader"),
  validate(pushToGroupSchema),
  controller.pushToGroup
);

router.delete(
  "/:id/groups/:groupId",
  protect,
  authorize("organization_leader"),
  controller.deleteGroup
);

module.exports = router;
