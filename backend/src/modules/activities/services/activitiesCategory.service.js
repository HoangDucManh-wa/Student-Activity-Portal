const prisma = require("../../../config/prisma");

// ============================
// Create category
// ============================
const createActivityCategoryService = async (data) => {
  if (!data.categoryName) {
    throw new Error("Category name is required");
  }

  const name = data.categoryName.trim().toLowerCase();

  const existingCategory = await prisma.activityCategory.findUnique({
    where: {
      categoryName: name,
    },
  });

  if (existingCategory && !existingCategory.isDeleted) {
    throw new Error("Category name already exists");
  }

  const category = await prisma.activityCategory.create({
    data: {
      categoryName: name,
    },
  });

  return category;
};
// ============================
// Get all categories (có limit)
// ============================
const getActivityCategoriesService = async (query) => {
  // Lấy limit từ query, nếu không có thì mặc định = 10
  const limit = Number(query.limit) || 10;

  const categories = await prisma.activityCategory.findMany({
    where: {
      isDeleted: false,
    },
    orderBy: {
      createdAt: "desc", // mới nhất trước
    },
    take: limit, // 🔥 giới hạn số lượng
  });

  return categories;
};
//Get by Name
const getActivityCategoriesByNameService = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const keyword = query.name || "";

  const categories = await prisma.activityCategory.findMany({
    where: {
      isDeleted: false,
      categoryName: {
        contains: keyword, // 🔥 tìm gần đúng
        mode: "insensitive", // 🔥 không phân biệt hoa thường
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  return categories;
};

// ============================
// Get category by id
// ============================
const getActivityCategoryByIdService = async (categoryId) => {
  const category = await prisma.activityCategory.findFirst({
    where: {
      categoryId: Number(categoryId), // ép kiểu về number
      isDeleted: false, // không lấy dữ liệu đã bị xóa
    },
  });

  // Nếu không tìm thấy -> báo lỗi
  if (!category) {
    throw new Error("Category not found");
  }

  return category;
};

// ============================
// Update category
// ============================
const updateActivityCategoryService = async (categoryId, data, userId) => {
  // Kiểm tra category có tồn tại không
  const category = await prisma.activityCategory.findFirst({
    where: {
      categoryId: Number(categoryId),
      isDeleted: false,
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  // Cập nhật dữ liệu
  const updatedCategory = await prisma.activityCategory.update({
    where: {
      categoryId: Number(categoryId),
    },
    data: {
      categoryName: data.categoryName, // cập nhật tên
      updatedBy: userId, // lưu người sửa
    },
  });

  return updatedCategory;
};

// ============================
// Soft delete category
// ============================
const deleteActivityCategoryService = async (categoryId, userId) => {
  // Kiểm tra tồn tại trước khi xóa
  const category = await prisma.activityCategory.findFirst({
    where: {
      categoryId: Number(categoryId),
      isDeleted: false,
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  // Soft delete: không xóa thật, chỉ đánh dấu
  const deletedCategory = await prisma.activityCategory.update({
    where: {
      categoryId: Number(categoryId),
    },
    data: {
      isDeleted: true, // đánh dấu đã xóa
      deletedAt: new Date(), // thời điểm xóa
      deletedBy: userId, // ai xóa
    },
  });

  return deletedCategory;
};

// Export các function để controller gọi
module.exports = {
  createActivityCategoryService,
  getActivityCategoriesService,
  getActivityCategoriesByNameService,
  getActivityCategoryByIdService,
  updateActivityCategoryService,
  deleteActivityCategoryService,
};
