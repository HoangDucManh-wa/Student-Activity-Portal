const aiService = require("./ai.service");
const ragService = require("./rag.service");
const AppError = require("../../utils/app-error");
const { success } = require("../../utils/response");

const search = async (req, res, next) => {
  try {
    const { query, limit } = req.body;
    const result = await aiService.smartSearch(query, limit);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const recommend = async (req, res, next) => {
  try {
    const { limit } = req.body;
    const result = await aiService.getRecommendations(
      req.user.MaNguoiDung,
      limit
    );
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const ask = async (req, res, next) => {
  try {
    const { question } = req.body;
    const result = await aiService.askAboutActivities(question);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

// Admin-only: trigger full re-index of AI vector store
const reindex = async (req, res, next) => {
  try {
    if (!req.user.roles?.includes("admin")) {
      throw new AppError("FORBIDDEN");
    }
    const stats = await ragService.reindexAll();
    return success(res, stats);
  } catch (err) {
    next(err);
  }
};

module.exports = { search, recommend, ask, reindex };
