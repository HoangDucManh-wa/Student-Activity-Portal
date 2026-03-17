const express = require("express");

const {
  createActivityCategoryController,
  getActivityCategoriesController,
  getActivityCategoriesByNameController,
  getActivityCategoryByIdController,
  updateActivityCategoryController,
  deleteActivityCategoryController,
} = require("./controllers/activitiesCategory.controller");

const { protect } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/role.middleware");

const router = express.Router();

// ============================
// Activity Category Routes
// ============================

// 🔹 Create category (chỉ admin)
router.post("/", protect, authorize("admin"), createActivityCategoryController);

// 🔹 Get all categories (có limit)
router.get("/", getActivityCategoriesController);

// 🔹 Search by name
router.get("/search", getActivityCategoriesByNameController);

// 🔹 Get by ID
router.get("/:categoryId", protect, getActivityCategoryByIdController);

// 🔹 Update category
router.put(
  "/:categoryId",
  protect,
  authorize("admin"),
  updateActivityCategoryController,
);

// 🔹 Delete category (soft delete)
router.delete(
  "/:categoryId",
  protect,
  authorize("admin"),
  deleteActivityCategoryController,
);

module.exports = router;
