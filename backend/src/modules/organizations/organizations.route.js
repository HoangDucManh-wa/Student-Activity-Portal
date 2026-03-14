const express = require("express");

const {
  createOrganizationController,
  getOrganizationsController,
  getOrganizationByIdController,
  updateOrganizationController,
  deleteOrganizationController,
} = require("./organizations.controller");

const router = express.Router();

/**
 * ============================
 * Organization Routes
 * ============================
 */

router.post("/", createOrganizationController);

router.get("/", getOrganizationsController);

router.get("/:organizationId", getOrganizationByIdController);

router.put("/:organizationId", updateOrganizationController);

router.delete("/:organizationId", deleteOrganizationController);

module.exports = router;
