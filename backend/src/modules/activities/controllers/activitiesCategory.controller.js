const {
  createActivityCategoryService,
  getActivityCategoriesService,
  getActivityCategoriesByNameService,
  getActivityCategoryByIdService,
  updateActivityCategoryService,
  deleteActivityCategoryService,
} = require("../services/activitiesCategory.service");

// ============================
// Create category
// ============================
const createActivityCategoryController = async (req, res) => {
  try {
    const data = req.body;

    const category = await createActivityCategoryService(data);

    return res.status(201).json({
      message: "Create category successfully",
      data: category,
    });
  } catch (error) {
    console.log(error); // 🔥 để debug nếu còn lỗi
    return res.status(400).json({
      message: error.message,
    });
  }
};

// ============================
// Get all categories (limit)
// ============================
const getActivityCategoriesController = async (req, res) => {
  try {
    const categories = await getActivityCategoriesService(req.query);

    return res.status(200).json({
      message: "Get categories successfully",
      data: categories,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

// ============================
// Search categories by name
// ============================
const getActivityCategoriesByNameController = async (req, res) => {
  try {
    const categories = await getActivityCategoriesByNameService(req.query);

    return res.status(200).json({
      message: "Search categories successfully",
      data: categories,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

// ============================
// Get category by id
// ============================
const getActivityCategoryByIdController = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await getActivityCategoryByIdService(categoryId);

    return res.status(200).json({
      message: "Get category successfully",
      data: category,
    });
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
};

// ============================
// Update category
// ============================
const updateActivityCategoryController = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const userId = req.user.userId;
    const data = req.body;

    const category = await updateActivityCategoryService(
      categoryId,
      data,
      userId,
    );

    return res.status(200).json({
      message: "Update category successfully",
      data: category,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

// ============================
// Delete category (soft delete)
// ============================
const deleteActivityCategoryController = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const userId = req.user.userId;

    const category = await deleteActivityCategoryService(categoryId, userId);

    return res.status(200).json({
      message: "Delete category successfully",
      data: category,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

// Export controller
module.exports = {
  createActivityCategoryController,
  getActivityCategoriesController,
  getActivityCategoriesByNameController,
  getActivityCategoryByIdController,
  updateActivityCategoryController,
  deleteActivityCategoryController,
};
